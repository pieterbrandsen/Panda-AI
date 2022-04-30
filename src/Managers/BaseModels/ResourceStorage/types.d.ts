type StructuresWithStorage =
  | StructureStorage
  | StructureTerminal
  | StructureLink
  | StructureContainer
  | StructureExtension
  | StructureSpawn
  | StructureLab
  | StructureTower;
interface StorageLevels {
  max: number;
  high: number;
  low: number;
  min: number;
  current: number;
}
interface BestStructureLoop {
  id: string;
  cache: StructureCache;
  levels: StorageLevels;
  originLevels?: StorageLevels;
}

interface BestDroppedResourceLoop {
  id: string;
  cache: DroppedResourceCache;
  amount: number;
  originLevels?: StorageLevels;
}

interface LevelCheckResult {
  level: StorageLevels;
  result: boolean;
}
