/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
// #region
type ManagerNames = "mineral" | "spawn" | "pioneer" | "source" | "controller" | "base";
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
  isActive: boolean;
}
// #endregion

// #region Source
interface FreezedSource {
  pos: FreezedRoomPosition;
  energy: number;
  structure?: {
    pos: FreezedRoomPosition;
    id: Id<Structure>;
    type: StructureConstant;
  };
}
interface SourceManagerMemory extends BaseManagerMemory {
  sources: StringMap<FreezedSource>;
}

interface ManagersMemory {
  mineral: MineralManagerMemory;
  spawn: SpawnManagerMemory;
  pioneer: PioneerManagerMemory;
  source: SourceManagerMemory;
}
interface ManagerObject {
  name: ManagerNames;
  roomName: string;
}
