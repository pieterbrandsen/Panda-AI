interface SourceMemory {
  maxEnergy: number;
  pos: FreezedRoomPosition;
  jobId?: string;
  structureId?: string;
  structureType?: BuildableStructureConstant;
  structureBuildJobId?: string;
}
interface SourceManagerMemory {
  sources: StringMap<SourceMemory>;
}
