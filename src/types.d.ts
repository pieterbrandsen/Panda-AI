interface StringMap<T> {
  [key: string]: T;
}

interface MainMemoryData<MemoryType,CacheType> {
  data: StringMap<MemoryType>;
  version: number;
  cache: StringMap<CacheType>
}
interface Memory {
  CreepsData: MainMemoryData<CreepMemory, CreepCache>;
  StructuresData: MainMemoryData<StructureMemory, StructureCache>;
  RoomsData: MainMemoryData<RoomMemory, RoomCache>;
}