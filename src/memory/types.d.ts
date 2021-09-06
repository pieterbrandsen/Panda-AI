/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
type LifeObjectType = "creep" | "structure" | "room";

interface MemoryVersion {
  version: number;
}
interface MemoryObject<T> extends MemoryVersion {
  data: StringMap<T>;
}
interface GarbageCollectionObject {
  data: unknown;
  deletedAtTick: number;
  liveObjectType: LifeObjectType;
}

interface RoomMemory {
  scout?: { name: string };
  managersMemory: ManagersMemory;
}
interface StructureMemory {
  manager: ManagerObject;
  lastExecutedAtTick: number;
  job?: AssignedJobObject;
  checkForNewJobAtTick?: number;
}
interface CreepMemory {
  manager: ManagerObject;
  lastExecutedAtTick: number;
  job?: AssignedJobObject;
  checkForNewJobAtTick?: number;
  possibleJobTypes: string[];
}
interface RootMemory extends MemoryVersion {
  roomsData: MemoryObject<RoomMemory>;
  structuresData: MemoryObject<StructureMemory>;
  creepsData: MemoryObject<CreepMemory>;
  garbageData: StringMap<GarbageCollectionObject>;
}
interface Memory extends RootMemory {}
type ObjectTypesInGarbageCollection =
  | Room
  | Structure
  | Creep
  | Structure
  | undefined;

type MemoryTypesInGarbageCollection =
  | RoomMemory
  | StructureMemory
  | CreepMemory
  | undefined;