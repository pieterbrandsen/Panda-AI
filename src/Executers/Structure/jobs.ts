import StructureData from "../../Managers/BaseModels/Helper/Structure/memory";
import JobsHelper from "../../Managers/BaseModels/Jobs/interface";

export default class StructureJobs<S extends Structure> extends JobsHelper {
  protected _structureInformation: StructureInformation<S>;

  protected _structureDataRepo: StructureData;

  protected _targetStructureDataRepo?: StructureData;

  constructor(structureInformation: StructureInformation<S>) {
    super();
    this._structureInformation = structureInformation;
    this._structureDataRepo = new StructureData(structureInformation.id);
    if (structureInformation.jobMemory!.targetId) {
      this._targetStructureDataRepo = new StructureData(
        structureInformation.jobMemory!.targetId
      );
    }
  }

  public UnassignJob(saveJob: boolean): boolean {
    const memory = this._structureInformation.memory!;
    const jobMemory = this._structureInformation.jobMemory as JobMemory;
    if (this._targetStructureDataRepo) {
      const targetStructureData = this._targetStructureDataRepo.GetData();
      if (targetStructureData.success) {
        const targetMemory = targetStructureData.memory as StructureMemory;
        if (targetMemory && jobMemory.fromTargetId) {
          delete targetMemory.energyOutgoing[jobMemory.fromTargetId];
          delete targetMemory.energyIncoming[jobMemory.fromTargetId];

          this._targetStructureDataRepo.UpdateData(
            targetStructureData.memory as StructureMemory,
            targetStructureData.cache as StructureCache
          );
        }
      }

      delete targetStructureData.memory!.energyIncoming[jobMemory.targetId];
      delete targetStructureData.memory!.energyOutgoing[jobMemory.targetId];

      if (jobMemory.fromTargetId) delete jobMemory.fromTargetId;
    }

    if (saveJob) {
      memory.permJobId = memory.jobId;
    }
    delete memory.jobId;
    return this._structureDataRepo.UpdateData(
      memory,
      this._structureInformation.cache!
    ).success;
  }

  // public AssignStructureJob(): void {}

  public static FindJobForStructure(): boolean {
    return false;
  }
}
