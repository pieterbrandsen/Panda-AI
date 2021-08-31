/* eslint-disable @typescript-eslint/no-empty-interface */

interface MemoryVersion {
  version: number;
}
interface MemoryObject<T> extends MemoryVersion {
  data: StringMap<T>;
}

interface RoomMemory {}
interface StructureMemory {}
interface CreepMemory {}
interface RootMemory extends MemoryVersion {
  roomsData: MemoryObject<RoomMemory>;
  structuresData: MemoryObject<StructureMemory>;
  creepsData: MemoryObject<CreepMemory>;
}
interface Memory extends RootMemory {}
