import { forOwn } from "lodash";
import RoomPositionHelper from "../../rooms/helpers/roomPosition";
import IsStructureType from "../../utils/constants/predicate";

/**
 * Base manager of all cache updaters
 * @param roomName - name of the room
 * @param managerName - name of manager
 */
export default function BaseManagerCache(roomName: string, managerName:ManagerNames) {
  const cache = Memory.roomsData.data[roomName].managersMemory;
  const managerCache = Memory.roomsData.data[roomName].managersMemory[managerName];
  
  forOwn(managerCache.creeps, (cacheCrp, key) => {
    const creep = Game.getObjectById<Creep>(key);

    if (creep && creep.room.name !== roomName) {
      Memory.creepsData.data[key].manager.roomName = creep.room.name;
      Memory.roomsData.data[creep.room.name].managersMemory.mineral.creeps[
        key
      ] = cacheCrp;
      delete managerCache.creeps[key];
    }
  });
  forOwn(managerCache.structures, (cacheStr, key) => {
    const structure = Game.getObjectById<Structure>(key);

    // TODO: Move this to extractor structure file
    if (!structure) {
      if (cache.mineral.mineral.extractorId === key) {
        delete cache.mineral.mineral.extractorId;
      }
    }
  });
  // forOwn(cache.structures, (cacheStr, key) => {
  //   const structure = Game.getObjectById<Structure>(key);
  // });
  forOwn(managerCache.constructionSites, (cachedSite, key) => {
    let site: ConstructionSite | null | undefined;
    if (cachedSite.id) {
      site = Game.getObjectById<ConstructionSite>(cachedSite.id);
    } else {
      const position = RoomPositionHelper.UnfreezeRoomPosition(cachedSite.pos);
      [site] = position.findInRange(FIND_CONSTRUCTION_SITES, 0);
    }

    if (!site) {
      delete managerCache.constructionSites[key];
      const position = RoomPositionHelper.UnfreezeRoomPosition(cachedSite.pos);
      const structureAtPos = position.findInRange(FIND_STRUCTURES, 0, {
        filter: IsStructureType(cachedSite.type),
      })[0];
      if (structureAtPos) {
        managerCache.structures[structureAtPos.id] = {
          type: structureAtPos.structureType,
          pos: structureAtPos.pos,
        };
        if (structureAtPos.structureType === STRUCTURE_EXTRACTOR) {
          cache.mineral.mineral.extractorId = structureAtPos.id;
        }
      }
    } else {
      if (!cachedSite.id) cachedSite.id = site.id;
      cachedSite.progressLeft = site.progressTotal - site.progress;
    }
  });
}