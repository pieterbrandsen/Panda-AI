interface SourceMemory {
  maxEnergy: number;
  pos: FreezedRoomPosition;
  jobId?: string;
  structureId?: string;
}
interface SourceManager {
  sources: StringMap<SourceMemory>;
}
