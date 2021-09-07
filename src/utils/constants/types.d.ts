interface VersionedMemory {
  Heap: number;
  Root: number;
  Room: number;
  Structure: number;
  Creep: number;
}

interface ResourceLevel {
  full: number;
  empty: number;
}
interface ResourceLevels {
  containerNormal: ResourceLevel;
  containerSource: ResourceLevel;
  containerController: ResourceLevel;
  linkNormal: ResourceLevel;
  linkHearth: ResourceLevel;
  linkSource: ResourceLevel;
  linkController: ResourceLevel;
  storage: ResourceLevel;
  terminal: ResourceLevel;
  tower: ResourceLevel;
  spawn: ResourceLevel;
  extension: ResourceLevel;
}
