type JobType =
  | "harvestMineral"
  | "harvestSource"
  | "transfer"
  | "transferSpawning"
  | "withdraw"
  | "pioneer"
  | "build"
  | "repair"
  | "upgrade";
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

  // Mineral
  mineralType?: MineralConstant;

  // Mineral, Harvest, Transfer, Withdraw
  amountLeft?: number;

  // Transfer, Withdraw
  resourceType?: ResourceConstant;
  requiredPercentage?: number;
}
interface AssignedJobObject {
  id: string;
  roomName: string;
}
