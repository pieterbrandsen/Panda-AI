type JobType = "harvestMineral";
interface Job {
  id: string;
  creationTime: number;
  nextUpdateTick:number;
  pos:FreezedRoomPosition;
  targetId: string;
  hasPriority: boolean;
  available: boolean;
  latestStructureOrCreepAssignedAtTick: number;
  amountLeftToMine?:number;
  type: JobType;
}
interface AssignedJobObject {
  id: string;
}