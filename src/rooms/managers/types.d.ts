/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
// #region
type ManagerNames =
  | "mineral"
  | "spawn"
  | "pioneer"
  | "source"
  | "controller"
  | "base";
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
interface BaseManagerCreepCache {}
interface BaseManagerMemory {
  jobs: Job[];
  structures: StringMap<BaseManagerStructureCache>;
  creeps: StringMap<BaseManagerCreepCache>;
  constructionSites: StringMap<BaseManagerConstructionSiteCache>;
}
interface BaseStructure {
  pos: FreezedRoomPosition;
  id: Id<Structure>;
  type: StructureConstant;
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

// #region Spawning
interface QueueCreep {
  body: BodyPartConstant[];
  bodyCost: number;
  memory: CreepMemory;
  name: string;
  roomName: string;
  managerName: ManagerNames;
  creepType: CreepType;
}
interface SpawnManagerMemory extends BaseManagerMemory {
  queue: QueueCreep[];
  lastSpawnedType: CreepType;
}
// #endregion

// #region Pioneer
interface PioneerManagerMemory extends BaseManagerMemory {
}
// #endregion

// #region Source
interface FreezedSource {
  pos: FreezedRoomPosition;
  energy: number;
  structure?: BaseStructure;
}
interface SourceManagerMemory extends BaseManagerMemory {
  sources: StringMap<FreezedSource>;
}
// #endregion

// #region Controller
interface ControllerManagerMemory extends BaseManagerMemory {
  energyStructure?: BaseStructure;
}
// #endregion

// #region Base
interface BaseBaseManagerMemory extends BaseManagerMemory {
  link?: BaseStructure;
}
// #endregion
interface ManagersMemory {
  mineral: MineralManagerMemory;
  spawn: SpawnManagerMemory;
  pioneer: PioneerManagerMemory;
  source: SourceManagerMemory;
  base: BaseBaseManagerMemory;
  controller: ControllerManagerMemory;
}
interface ManagerObject {
  name: ManagerNames;
  roomName: string;
}
