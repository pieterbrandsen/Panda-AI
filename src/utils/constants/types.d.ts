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
interface EnergyResourceLevels {
  containerSource: ResourceLevel;
  containerController: ResourceLevel;
  linkHearth: ResourceLevel;
  linkSource: ResourceLevel;
  linkController: ResourceLevel;
  storage: ResourceLevel;
  terminal: ResourceLevel;
  tower: ResourceLevel;
  spawn: ResourceLevel;
  extension: ResourceLevel;
}
interface DefaultResourceLevels {
  mineral: ResourceLevel;
  compounds: ResourceLevel;
  factory: ResourceLevel;
}

interface BodyIteratee {
  cost: number;
  body: BodyPartConstant[];
  reqBodyPartPerLoop: number;
}
interface BodyIterators {
  harvestMineral: BodyIteratee;
  build: BodyIteratee;
  pioneer: BodyIteratee;
}
