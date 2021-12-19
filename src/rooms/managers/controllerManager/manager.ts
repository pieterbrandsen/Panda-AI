import { forOwn } from "lodash";
import CacheManager from "../../../cache/updateCache";
import ExecuteCreep from "../../../creep/executeCreep";
import ExecuteStructure from "../../../structures/executeStructure";
import CreateConstructionSite from "../../helpers/createConstructionSite";
import EnergyStructurePositioningHelper from "../../helpers/getBestEnergyStructureSpot";
import RoomPositionHelper from "../../helpers/roomPosition";
import JobCreatorHelper from "../../jobs/creation";
import JobUpdater from "../../jobs/update";
import UpdateSpawningQueue from "../spawnManager/update";

export default class ControllerManager {
  /**
   * Execute the mineral manager
   * @param room  - The room
   */
  public static Run(room: Room): void {
    const cache = Memory.roomsData.data[room.name].managersMemory.controller;

    JobUpdater.Run(cache.jobs);

    CacheManager.UpdateControllerManager(room);

    const roomController = room.controller as StructureController;
    const requiredStructureType =
      roomController.level >= 7 ? STRUCTURE_LINK : STRUCTURE_CONTAINER;

      if (!cache.jobs.find((j) => j.targetId === roomController.id)) {
        cache.jobs.push(
          JobCreatorHelper.Upgrade(roomController)
        );
      }

      // TODO: Check every 100 ticks
      if (
        cache.energyStructure &&
        cache.energyStructure.type !== requiredStructureType
      ) {
        const structure = Game.getObjectById<Structure>(
            cache.energyStructure.id
        );
        if (structure) {
          structure.destroy();
        }
        delete cache.energyStructure;
      }

      // TODO: Check every 100 ticks
      if (
        !cache.energyStructure &&
        roomController.level >= 2 &&
        Object.keys(cache.constructionSites).length === 0
      ) {
        const bestPos = EnergyStructurePositioningHelper.GetBestStructureSpot(
          room,
          roomController.pos,
          requiredStructureType
        );
        CreateConstructionSite(room, bestPos, requiredStructureType, cache);
      }

    forOwn(cache.creeps, (cacheCrp, key) => {
      ExecuteCreep.Execute(cacheCrp, key, "controller");
    });
    forOwn(cache.structures, (cacheStr, key) => {
      ExecuteStructure.Execute(cacheStr, key, "controller");
    });
    UpdateSpawningQueue.Update(room, "upgrade", "controller");
    UpdateSpawningQueue.Update(room, "build", "controller");
    UpdateSpawningQueue.Update(room, "repair", "controller");
  }
}
