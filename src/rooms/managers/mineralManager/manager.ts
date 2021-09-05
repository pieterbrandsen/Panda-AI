import { forEach } from "lodash";
import CacheManager from "../../../cache/updateCache";
import CreateConstructionSite from "../../helpers/createConstructionSite";
import {
  PositionToStringConverter,
  UnfreezeRoomPosition,
} from "../../helpers/roomPosition";

export default class MineralManager {
  /**
   * Execute the mineral manager
   * @param room  - The room
   */
  public static Run(room: Room): void {
    if (!room.controller || room.controller.level < 6) return;

    // TODO: Update jobs

    CacheManager.UpdateMineralManager(room);

    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
    const extractor = Game.getObjectById<StructureExtractor>(
      cache.mineral.extractorId as Id<StructureExtractor>
    );

    if (cache.mineral.amount > 0) {
      // TODO: Create job for 10K or amount left if less then 10K
    }

    if (!extractor) {
      const extractorConstructionSite =
        cache.constructionSites[PositionToStringConverter(cache.mineral.pos)];
      if (!extractorConstructionSite) {
        CreateConstructionSite(
          room,
          UnfreezeRoomPosition(cache.mineral.pos),
          STRUCTURE_EXTRACTOR,
          cache
        );
      }
    }

    forEach(Object.keys(cache.creeps), (id) => {
      const creep = Game.getObjectById<Creep>(id as Id<Creep>);
      if (creep) {
        // TODO: Execute creep
      }
    });

    // TODO: Spawning manager
  }
}
