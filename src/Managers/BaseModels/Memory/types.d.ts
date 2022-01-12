type MemoryObjects = CreepMemory | StructureMemory | RoomMemory; 
type MemoryTypes = "Creep"|"Structure"|"Room";

interface BaseMemory {
    version: number;
}

interface CreepMemory extends BaseMemory{
}
interface StructureMemory  extends BaseMemory{
}
interface RoomMemory  extends BaseMemory{
}