import { forOwn } from "lodash";
import RoomPositionHelper from "../../rooms/helpers/roomPosition";
import IsStructureType from "../../utils/constants/predicate";


export default function UpdateSpawnManagerCache(room: Room): void {
  const cache = Memory.roomsData.data[room.name].managersMemory.spawn;

  forOwn(cache.creeps, (cacheCrp, key) => {
    const creep = Game.getObjectById<Creep>(key);

    if (creep && creep.room.name !== room.name) {
      Memory.creepsData.data[key].manager.roomName = creep.room.name;
      Memory.roomsData.data[creep.room.name].managersMemory.mineral.creeps[
        key
      ] = cacheCrp;
      delete cache.creeps[key];
    }
  });
  // forOwn(cache.structures, (cacheStr, key) => {
  //   const structure = Game.getObjectById<Structure>(key);
  // });
  forOwn(cache.constructionSites, (cachedSite, key) => {
    let site: ConstructionSite | null | undefined;
    if (cachedSite.id) {
      site = Game.getObjectById<ConstructionSite>(cachedSite.id);
    } else {
      const position = RoomPositionHelper.UnfreezeRoomPosition(cachedSite.pos);
      [site] = position.findInRange(FIND_CONSTRUCTION_SITES, 0);
    }

    if (!site) {
      delete cache.constructionSites[key];
      const position = RoomPositionHelper.UnfreezeRoomPosition(cachedSite.pos);
      const structureAtPos = position.findInRange(FIND_STRUCTURES, 0, {
        filter: IsStructureType(cachedSite.type),
      })[0];
      if (structureAtPos) {
        cache.structures[structureAtPos.id] = {
          type: structureAtPos.structureType,
          pos: structureAtPos.pos,
        };
      }
    } else {
      if (!cachedSite.id) cachedSite.id = site.id;
      cachedSite.progressLeft = site.progressTotal - site.progress;
    }
  });
}
