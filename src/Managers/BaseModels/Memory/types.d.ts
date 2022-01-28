/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
interface CRUDResult<T> {
  success: boolean;
  data: T | undefined;
}

interface MainMemoryData<MemoryType, CacheType> {
  data: StringMap<MemoryType>;
  version: number;
  cache: StringMap<CacheType>;
}

interface BaseMemory {
  version: number;
}

interface CreepMemory extends BaseMemory {
  jobId?: string;
  isRemoteCreep: boolean;
  energyIncoming: StringMap<number>;
  energyOutgoing: StringMap<number>;
}
interface StructureMemory extends BaseMemory {
  jobId?: string;
  isSourceStructure?: boolean;
  energyIncoming: StringMap<number>;
  energyOutgoing: StringMap<number>;
}
interface RemoteRoom {
  distance: number;
}
interface RoomMemory extends BaseMemory {
  remoteRooms?: StringMap<RemoteRoom>;
  remoteOriginRoom?: string;

  sourceManager: SourceManager;
  controllerManager: ControllerManager;
  mineralManager: MineralManager;
  spawnManager: SpawnManager;
}
interface Memory extends BaseMemory {
  CreepsData: MainMemoryData<CreepMemory, CreepCache>;
  StructuresData: MainMemoryData<StructureMemory, StructureCache>;
  RoomsData: MainMemoryData<RoomMemory, RoomCache>;
  JobsData: MainMemoryData<JobMemory, JobCache>;
}

type MemoryObjects = CreepMemory | StructureMemory | RoomMemory | JobMemory;
interface DoubleCRUDResult<M extends MemoryObjects, C extends CacheObjects> {
  success: boolean;
  memory: M | undefined;
  cache: C | undefined;
}
interface FreezedRoomPosition {
  x: number;
  y: number;
  roomName: string;
}

type MemoryTypes = "Creep" | "Structure" | "Room" | "Global" | "Job";
