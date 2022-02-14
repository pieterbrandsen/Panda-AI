import JobData from "../Job/memory";

export default class StructureRepair {
  static GetMissingHits(structure: Structure): number {
    return structure.hitsMax - structure.hits;
  }

  static RepairStructureIfNeeded(
    structure: Structure,
    cache: StructureCache
  ): boolean {
    const missingHits = this.GetMissingHits(structure);
    if (missingHits > 0) {
      const jobData = JobData.GetMemory(JobData.GetJobId("Repair", cache.pos));
      if (jobData.success) return true;
      return JobData.Initialize({
        executer: cache.executer,
        pos: cache.pos,
        objectType: "Structure",
        targetId: structure.id,
        type: "Repair",
        amountToTransfer: missingHits,
        structureType: structure.structureType,
      }).success;
    }
    return false;
  }
}
