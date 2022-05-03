import JobData from "../../Managers/BaseModels/Helper/Job/memory";

export default class StructureRepair<S extends Structure> {
  protected _structureInformation: StructureInformation<S>;
    constructor(structureInformation: StructureInformation<S>) {
      this._structureInformation = structureInformation;
    }
  private GetMissingHits(): number {
    const structure = this._structureInformation.structure!;
    return structure.hitsMax - structure.hits;
  }

  protected CreateRepairJobIfNeeded(): boolean {
    const structure = this._structureInformation.structure!;
    const cache = this._structureInformation.cache!;
    const missingHits = this.GetMissingHits();
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
