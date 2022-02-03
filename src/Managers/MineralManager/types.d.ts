interface MineralMemory {
  jobId?: string;
  pos: FreezedRoomPosition;
  id: string;
  type: MineralConstant;
}
interface MineralManager {
  mineral?: MineralMemory;
  extractorId?: string;
  extractorBuildJobId?: string;
}
