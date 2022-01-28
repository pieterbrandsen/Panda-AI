/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
type JobTypes =
  | "HarvestSource"
  | "TransferSpawn"
  | "TransferStructure"
  | "UpgradeController"
  | "HarvestMineral"
  | "ReserveController"
  | "Build"
  | "Repair";

type JobObjectExecuter = "Creep" | "Structure";

interface JobMemory extends BaseMemory {
  pos: FreezedRoomPosition;
  lastAssigned: number;
  targetId: string;

  fromTargetId?: string;
  amountToTransfer?: number;

  structureType?: StructureConstant;
  objectType: JobObjectExecuter;

  maxCreepsCount?: number;
}
