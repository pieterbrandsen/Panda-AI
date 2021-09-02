/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
type LifeObjectType = "creep" | "structure" | "room" | "mineral";

interface MemoryVersion {
  version: number;
}
interface MemoryObject<T> extends MemoryVersion {
  cache: string[];
  data: StringMap<T>;
}
interface GarbageCollectionObject {
  data: unknown;
  deletedAtTick: number;
  liveObjectKey: string;
  liveObjectType: LifeObjectType;
}
interface RoomCacheObject {
  id: string;
}


interface RoomMemory {
  cache: StringMap<RoomCacheObject[]>;
}
interface StructureMemory {}
interface CreepMemory {}
interface RootMemory extends MemoryVersion {
  roomsData: MemoryObject<RoomMemory>;
  structuresData: MemoryObject<StructureMemory>;
  creepsData: MemoryObject<CreepMemory>;
  garbageData: GarbageCollectionObject[];
  heapLifeTimes: number[];
  lastHeapLifeTime: number;
}
interface Memory extends RootMemory {}
type ObjectTypesInGarbageCollection =
  | Room
  | Structure
  | Creep
  | Structure
  | null;

type MemoryTypesInGarbageCollection =
  | RoomMemory
  | StructureMemory
  | CreepMemory
  | undefined;
