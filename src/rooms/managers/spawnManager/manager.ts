import { forEach, forOwn, remove } from "lodash";
import CacheManager from "../../../cache/updateCache";
import ExecuteCreep from "../../../creep/executeCreep";
import ExecuteStructure from "../../../structures/executeStructure";
import JobUpdater from "../../jobs/update";
import GetNextCreep from "./helpers/getNextCreep";
import UpdateSpawningQueue from "./update";

export default class SpawnManager {
  /**
   * Execute the spawn manager
   * @param room - The room to manage spawns for
   */
  public static Run(room: Room): void {
    const cache = Memory.roomsData.data[room.name].managersMemory.spawn;

    JobUpdater.Run(cache.jobs);

    CacheManager.UpdateSpawnManager(room);

    forOwn(cache.creeps, (cacheCrp, key) => {
      ExecuteCreep.Execute(cacheCrp, key, "spawn");
    });
    const spawns: StructureSpawn[] = [];
    forOwn(cache.structures, (cacheStr, key) => {
      const structure = Game.getObjectById(key);
      if (structure && cacheStr.type === STRUCTURE_SPAWN) {
        spawns.push(structure as StructureSpawn);
      }
      ExecuteStructure.Execute(cacheStr, key, "spawn");
    });

    forEach(spawns, (spawn) => {
      if (cache.queue.length === 0 || spawn.spawning) return;

      const pioneersInQueue = cache.queue.filter(
        (c) => c.creepType === "pioneer"
      );
      if (room.energyAvailable < 300) return;
      const queueCreep =
        pioneersInQueue.length > 0
          ? pioneersInQueue[0]
          : GetNextCreep(room.name);
      const result = spawn.spawnCreep(queueCreep.body, queueCreep.name);
      if (result !== OK) return;

      cache.lastSpawnedType = queueCreep.creepType;
      remove(cache.queue, {
        name: queueCreep.name,
      });
      Memory.creepsData.data[queueCreep.name] = queueCreep.memory;

      Memory.roomsData.data[room.name].managersMemory[
        queueCreep.managerName
      ].creeps[queueCreep.name] = {};
    });

    UpdateSpawningQueue.Update(room, "transferSpawning", "spawn");
    UpdateSpawningQueue.Update(room, "withdraw", "spawn");
  }
}
