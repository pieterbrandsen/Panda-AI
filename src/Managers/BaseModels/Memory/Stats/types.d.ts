interface ControllerStatsMemory {
  level: number;
  progress: number;
  progressTotal: number;
  ticksToDowngrade: number;
}
interface RoomStatsMemory {
  energyIncoming: StringMapGeneric<number, IncomingJobTypes>;
  energyOutgoing: StringMapGeneric<number, OutgoingJobTypes>;
  controller: ControllerStatsMemory;
  spawnEnergyOutgoing: StringMapGeneric<number, CreepTypes>;
}
interface StatsMemory extends BaseMemory {
  rooms: StringMap<RoomStatsMemory>;
  resources: {
    PIXEL: number;
    CPU_UNLOCK: number;
    ACCESS_KEY: number;
  };
}

type MemoryStatsObjects = RoomStatsMemory | StatsMemory;
