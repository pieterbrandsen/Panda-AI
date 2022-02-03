import IJobData from "../Job/jobMemory";

export default class {
  static GetMissingHits(structure: Structure): number {
    return structure.hitsMax - structure.hits;
  }

  static RepairStructureIfNeeded(
    structure: Structure,
    cache: StructureCache
  ): boolean {
    const missingHits = this.GetMissingHits(structure);
    if (missingHits > 0) {
      const jobData = IJobData.GetMemory(
        IJobData.GetJobId("Repair", cache.pos)
      );
      if (jobData.success) return true;
      return IJobData.Initialize({
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
