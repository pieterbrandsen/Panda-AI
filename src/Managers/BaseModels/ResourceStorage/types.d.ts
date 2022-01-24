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
}

interface LevelCheckResult {
  level: StorageLevels;
  result:boolean;
}
