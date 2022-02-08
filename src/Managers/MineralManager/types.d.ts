interface MineralMemory {
  jobId?: string;
  pos: FreezedRoomPosition;
  id: string;
  type: MineralConstant;
  structureId?: string;
  structureBuildJobId?: string;
}
interface MineralManager {
  mineral?: MineralMemory;
}
