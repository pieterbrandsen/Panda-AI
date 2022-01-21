interface SourceMemory {
  maxEnergy: number;
  pos: FreezedRoomPosition;
  jobId?: string;
}
interface SourceManager {
  sources: StringMap<SourceMemory>;
}
