/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
interface CRUDResult<T> {
  success: boolean;
  data: T | undefined;
}
interface ValidatedMemory {
  isValid: boolean;
  nonValidMemoryObjects: string[];
}
interface BaseMemory {
  version: number;
}

interface CreepMemory extends BaseMemory {}
interface StructureMemory extends BaseMemory {}
interface RoomMemory extends BaseMemory {}

type MemoryObjects = CreepMemory | StructureMemory | RoomMemory;
type MemoryTypes = "Creep" | "Structure" | "Room";
