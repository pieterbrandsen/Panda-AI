import { forOwn } from "lodash";
import CacheManager from "../../../cache/updateCache";
import ExecuteCreep from "../../../creep/executeCreep";
import ExecuteStructure from "../../../structures/executeStructure";
import CreateConstructionSite from "../../helpers/createConstructionSite";
import JobCreatorHelper from "../../jobs/creation";
import JobUpdater from "../../jobs/update";
import UpdateSpawningQueue from "../spawnManager/update";
import EnergyStructurePositioningHelper from "../../helpers/getBestEnergyStructureSpot";

export default class SourceManager {
  /**
   * Execute the source manager
   * @param room  - The room
   */
  public static Run(room: Room): void {
    const cache = Memory.roomsData.data[room.name].managersMemory.source;

    JobUpdater.Run(cache.jobs);

    CacheManager.UpdateSourceManager(room);

    const roomController = room.controller as StructureController;
    const requiredStructureType =
      roomController.level >= 7 ? STRUCTURE_LINK : STRUCTURE_CONTAINER;

    forOwn(cache.sources, (freezedSource: FreezedSource, id: string) => {
      if (!cache.jobs.find((j) => j.targetId === id)) {
        cache.jobs.push(
          JobCreatorHelper.HarvestSource(freezedSource, id as Id<Source>)
        );
      }

      // TODO: Check every 100 ticks
      if (
        freezedSource.structure &&
        freezedSource.structure.type !== requiredStructureType
      ) {
        const structure = Game.getObjectById<Structure>(
          freezedSource.structure.id
        );
        if (structure) {
          structure.destroy();
        }
        delete freezedSource.structure;
      }

      // TODO: Check every 100 ticks
      if (
        !freezedSource.structure &&
        roomController.level >= 2 &&
        Object.keys(cache.constructionSites).length === 0
      ) {
        const bestPos = EnergyStructurePositioningHelper.GetBestStructureSpot(
          room,
          freezedSource.pos,
          requiredStructureType
        );
        CreateConstructionSite(room, bestPos, requiredStructureType, cache);
      }
    });

    forOwn(cache.creeps, (cacheCrp, key) => {
      ExecuteCreep.Execute(cacheCrp, key, "source");
    });
    forOwn(cache.structures, (cacheStr, key) => {
      ExecuteStructure.Execute(cacheStr, key, "source");
    });
    UpdateSpawningQueue.Update(room, "harvestSource", "source");
    UpdateSpawningQueue.Update(room, "build", "source");
    UpdateSpawningQueue.Update(room, "repair", "source");
  }
}
