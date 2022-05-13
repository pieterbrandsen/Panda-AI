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

  public CreateRepairJobIfNeeded(): boolean {
    const structure = this._structureInformation.structure!;
    const cache = this._structureInformation.cache!;
    const missingHits = this.GetMissingHits();
    if (missingHits > 0) {
      const jobType: JobTypes = "Repair";
      const jobId = JobData.GetJobId(jobType, cache.pos);
      const jobRepo = new JobData(jobId);
      if (jobRepo.GetData().success) return true;
      return jobRepo.InitializeData({
        executer: cache.executer,
        pos: cache.pos,
        objectType: "Structure",
        targetId: structure.id,
        type: jobType,
        amountToTransfer: missingHits,
        structureType: structure.structureType,
      }).success;
    }
    return false;
  }
}
