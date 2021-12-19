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
  pioneer: BodyIteratee;
  harvestMineral: BodyIteratee;
  harvestSource: BodyIteratee;
  build: BodyIteratee;
  transfer: BodyIteratee;
  transferSpawning: BodyIteratee;
  withdraw: BodyIteratee;
  repair: BodyIteratee;
 }
