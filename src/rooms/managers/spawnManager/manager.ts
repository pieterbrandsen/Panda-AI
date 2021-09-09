import { forEach, forOwn, remove } from "lodash";
import CacheManager from "../../../cache/updateCache";
import GetNextCreepType from "./helpers/getNextCreep";

export default class SpawnManager {
  /**
   * Execute the spawn manager
   * @param room - The room to manage spawns for
   */
  public static Run(room: Room): void {
    const cache = Memory.roomsData.data[room.name].managersMemory.spawn;

    CacheManager.UpdateSpawnManager(room);

    // forOwn(cache.creeps, (cacheCrp, key) => {});
    const spawns: StructureSpawn[] = [];
    forOwn(cache.structures, (cacheStr, key) => {
      const structure = Game.getObjectById(key);
      if (structure instanceof StructureSpawn) {
        spawns.push(structure);
      }
    });

    forEach(spawns, (spawn) => {
      if (cache.queue.length === 0) return;

      const pioneersInQueue = cache.queue.filter(
        (c) => c.creepType === "pioneer"
      );
      if (room.energyAvailable < 300) return;
      const queueCreep =
        pioneersInQueue.length > 0
          ? pioneersInQueue[0]
          : GetNextCreepType(room.name);
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
  }
}
