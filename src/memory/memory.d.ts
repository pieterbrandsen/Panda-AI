/* eslint-disable @typescript-eslint/no-empty-interface */

interface MemoryVersion {
  version: number;
}

interface RoomMemory extends MemoryVersion {}
interface StructureMemory extends MemoryVersion {}
interface CreepMemory extends MemoryVersion {}
interface RootMemory extends MemoryVersion {
  rooms: StringMap<RoomMemory>;
  structures: StringMap<StructureMemory>;
  creeps: StringMap<CreepMemory>;
}
interface Memory extends RootMemory {}
