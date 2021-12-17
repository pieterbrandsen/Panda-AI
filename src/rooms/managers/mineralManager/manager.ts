import { forOwn } from "lodash";
import CacheManager from "../../../cache/updateCache";
import ExecuteCreep from "../../../creep/executeCreep";
import ExecuteStructure from "../../../structures/executeStructure";
import CreateConstructionSite from "../../helpers/createConstructionSite";
import RoomPositionHelper from "../../helpers/roomPosition";
import JobCreatorHelper from "../../jobs/creation";
import JobUpdater from "../../jobs/update";
import UpdateSpawningQueue from "../spawnManager/update";

export default class MineralManager {
  /**
   * Execute the mineral manager
   * @param room  - The room
   */
  public static Run(room: Room): void {
    if (!room.controller || room.controller.level < 6 || !room.storage) return;
    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;

    JobUpdater.Run(cache.jobs);

    CacheManager.UpdateMineralManager(room);

    const extractor = Game.getObjectById<StructureExtractor>(
      cache.mineral.extractorId as Id<StructureExtractor>
    );

    if (cache.mineral.amount > 0 && extractor) {
      if (!cache.jobs.find((j) => j.targetId === cache.mineral.id)) {
        cache.jobs.push(JobCreatorHelper.HarvestMineral(cache.mineral));
      }
    }

    // TODO: Check every 100 ticks
    if (!extractor) {
      const extractorConstructionSite =
        cache.constructionSites[
          RoomPositionHelper.PositionToStringConverter(cache.mineral.pos)
        ];
      if (!extractorConstructionSite) {
        CreateConstructionSite(
          room,
          RoomPositionHelper.UnfreezeRoomPosition(cache.mineral.pos),
          STRUCTURE_EXTRACTOR,
          cache
        );
      }
    }

    forOwn(cache.creeps, (cacheCrp, key) => {
      ExecuteCreep.Execute(cacheCrp, key, "mineral");
    });
    forOwn(cache.structures, (cacheStr, key) => {
      ExecuteStructure.Execute(cacheStr, key, "mineral");
    });

    UpdateSpawningQueue.Update(room, "harvestMineral", "mineral");
    UpdateSpawningQueue.Update(room, "build", "mineral");
    UpdateSpawningQueue.Update(room, "repair", "mineral");
  }
}
