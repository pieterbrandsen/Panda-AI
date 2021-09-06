type JobType = "harvestMineral";
interface Job {
  // Base
  id: string;
  creationTime: number;
  nextUpdateTick: number;
  pos: FreezedRoomPosition;
  targetId: string;
  hasPriority: boolean;
  available: boolean;
  latestStructureOrCreepAssignedAtTick: number;
  type: JobType;
  
  // Mineral, Harvest
  amountLeftToMine?: number;
}
interface AssignedJobObject {
  id: string;
}
