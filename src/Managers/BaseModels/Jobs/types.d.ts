/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
type IncomingJobTypes =
  | "HarvestSource"
  | "PickupResource"
  | "WithdrawResource"
  | "HarvestMineral";
type OutgoingJobTypes =
  | "TransferSpawn"
  | "TransferStructure"
  | "UpgradeController"
  | "Build"
  | "DroppedEnergyDecay"
  | "SpawnCreeps"
  | "Repair";
type OtherJobTypes = "ReserveController";
type JobTypeTypes = "Incoming" | "Outgoing" | "Other";
type JobTypes = IncomingJobTypes | OutgoingJobTypes | OtherJobTypes;

type JobObjectExecuter = "Creep" | "Structure" | "Resource";
type JobResult = "continue" | "done" | "empty" | "full";

interface JobMemory extends BaseMemory {
  pos: FreezedRoomPosition;
  lastAssigned: number;
  targetId: string;

  fromTargetId?: string;
  amountToTransfer?: number;

  structureType?: StructureConstant;
  objectType: JobObjectExecuter;

  maxCreepsCount?: number;
  assignedCreeps: string[];
}
