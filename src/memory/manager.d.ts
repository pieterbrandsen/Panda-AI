// #region
interface BaseManagerConstructionSiteCache {
  type: BuildableStructureConstant;
  pos: FreezedRoomPosition;
  progressLeft: number;
  id?: Id<ConstructionSite>;
}
interface BaseManagerStructureCache {
  type: StructureConstant;
  pos: FreezedRoomPosition;
}
interface BaseManagerCreepCache {
  type: MineralConstant;
}
interface BaseManagerMemory {
  structures: StringMap<BaseManagerStructureCache>;
  creeps: StringMap<BaseManagerCreepCache>;
  constructionSites: StringMap<BaseManagerConstructionSiteCache>;
}
// #endregion

// #region Mineral
interface MineralManagerMineralCache {
  id: string;
  type: MineralConstant;
  amount: number;
  pos: FreezedRoomPosition;
  extractorId?: Id<StructureExtractor>;
}

interface MineralManagerMemory extends BaseManagerMemory {
  mineral: MineralManagerMineralCache;
}
// #endregion

interface ManagersMemory {
  mineral: MineralManagerMemory;
}
interface ManagerObject {
  name: ManagerNames;
  roomName: string;
}
