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
interface Memory extends BaseMemory {
  CreepsData: MainMemoryData<CreepMemory, CreepCache>;
  StructuresData: MainMemoryData<StructureMemory, StructureCache>;
  RoomsData: MainMemoryData<RoomMemory, RoomCache>;
  JobsData: MainMemoryData<JobMemory, JobCache>;
}

interface CreepMemory extends BaseMemory {
  jobId?:string;
  energyIncoming: StringMap<number>;
  energyOutgoing: StringMap<number>;
}
interface StructureMemory extends BaseMemory {
  isSourceStructure?: boolean;
  energyIncoming: StringMap<number>;
  energyOutgoing: StringMap<number>;
}
interface RemoteRoom {
  distance:number;
}
interface RoomMemory extends BaseMemory {
  remoteRooms:StringMap<RemoteRoom>
}

interface FreezedRoomPosition {
  x: number;
  y: number;
  roomName: string;
}

type MemoryObjects = CreepMemory | StructureMemory | RoomMemory | JobMemory;
type MemoryTypes = "Creep" | "Structure" | "Room" | "Global" | "Job";
