import { forOwn } from "lodash";
import IsStructureType from "../../utils/constants/predicate";
import RoomPositionHelper from "../../rooms/helpers/roomPosition";

export default function UpdateMineralManagerCache(room: Room): void {
  const mineral: Mineral = room.find(FIND_MINERALS)[0];
  const cache = Memory.roomsData.data[room.name].managersMemory.mineral;

  if (!mineral || !mineral.room) {
    return;
  }

  if (cache.mineral.id !== mineral.id) {
    cache.mineral = {
      type: mineral.mineralType,
      id: mineral.id,
      amount: mineral.mineralAmount,
      pos: mineral.pos,
    };
  } else {
    cache.mineral.amount = Math.round(mineral.mineralAmount);
  }

  const extractor: StructureExtractor = mineral.pos.findInRange<StructureExtractor>(
    FIND_STRUCTURES,
    0,
    { filter: IsStructureType(STRUCTURE_EXTRACTOR) }
  )[0];
  if (extractor && cache.structures[extractor.id] === undefined) {
    cache.structures[extractor.id] = {
      type: extractor.structureType,
      pos: extractor.pos,
    };
    cache.mineral.extractorId = extractor.id;
  }

  forOwn(cache.creeps, (cacheCrp, key) => {
    const creep = Game.getObjectById<Creep>(key);

    if (creep && creep.room.name !== room.name) {
      Memory.creepsData.data[key].manager.roomName = creep.room.name;
      Memory.roomsData.data[creep.room.name].managersMemory.mineral.creeps[
        key
      ] = cacheCrp;
      delete cache.creeps[key];
    }

    // TODO: Garbage collection in its file
  });
  forOwn(cache.structures, (cacheStr, key) => {
    const structure = Game.getObjectById<Structure>(key);

    // TODO: Move this to extractor structure file
    if (!structure) {
      if (cache.mineral.extractorId === key) {
        delete cache.mineral.extractorId;
      }
      delete cache.structures[key];
      // TODO: Garbage collection in its file
    }
  });
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
