type JobType = "harvestMineral" | "transfer" | "withdraw";
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
  hasNeedOfFulfillment: boolean;

  // Mineral, Harvest, Transfer, Withdraw
  amountLeft?: number;

  // Transfer, Withdraw
  resourceType?: ResourceConstant;
  requiredPercentage?: number;
}
interface AssignedJobObject {
  id: string;
}
