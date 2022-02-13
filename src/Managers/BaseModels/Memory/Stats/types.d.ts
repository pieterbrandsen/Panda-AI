interface GlobalControllerStatsMemory {
  level: number;
  progress: number;
  progressTotal: number;
}
interface ControllerStatsMemory extends GlobalControllerStatsMemory {
  ticksToDowngrade: number;
}
interface RoomStatsMemory {
  energyIncoming: StringMapGeneric<number, IncomingJobTypes>;
  energyOutgoing: StringMapGeneric<number, OutgoingJobTypes>;
  controller: ControllerStatsMemory;
  spawnEnergyOutgoing: StringMapGeneric<number, CreepTypes>;
  creepsCount: number;
  structuresCount: number;
  isSpawning?: StringMap<boolean>;
  spawnEnergy?: {
    energy: number;
    capacity: number;
  };
}
interface StatsMemory extends BaseMemory {
  rooms: StringMap<RoomStatsMemory>;
  resources: {
    PIXEL: number;
    CPU_UNLOCK: number;
    ACCESS_KEY: number;
  };
  gcl: GlobalControllerStatsMemory;
}

type MemoryStatsObjects = RoomStatsMemory | StatsMemory;
