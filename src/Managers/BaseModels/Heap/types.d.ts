/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
type HeapTypes = "Creep" | "Structure" | "Room" | "Global";

interface BaseHeap {}
interface CreepHeap extends BaseHeap {}
interface StructureHeap extends BaseHeap {}
interface RoomHeap extends BaseHeap {
  stats: RoomStatsMemory;
}

interface GlobalData {
  Version: number;
  CreepsData: StringMap<CreepHeap>;
  StructuresData: StringMap<StructureHeap>;
  RoomsData: StringMap<RoomHeap>;
}

declare namespace NodeJS {
  interface Global {
    Version: number;
    CreepsData: StringMap<CreepHeap>;
    StructuresData: StringMap<StructureHeap>;
    RoomsData: StringMap<RoomHeap>;
    lastShardTarget?: string;
  }
}
