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
}

interface CreepMemory extends BaseMemory {}
interface StructureMemory extends BaseMemory {}
interface RoomMemory extends BaseMemory {}

type MemoryObjects = CreepMemory | StructureMemory | RoomMemory;
type MemoryTypes = "Creep" | "Structure" | "Room" | "Global";
