import ILinkRole from "./link";
import IJobs from "../../../Managers/BaseModels/Jobs/interface";

interface IExecuteCreepRole {}

export default class implements IExecuteCreepRole {
  structure: Structure;

  structureCache: StructureCache;

  structureMemory: StructureMemory;

  jobCache: JobCache;

  jobMemory: JobMemory;

  constructor(
    structure: Structure,
    structureCache: StructureCache,
    structureMemory: StructureMemory,
    jobCache: JobCache,
    jobMemory: JobMemory
  ) {
    this.structure = structure;
    this.structureCache = structureCache;
    this.structureMemory = structureMemory;
    this.jobCache = jobCache;
    this.jobMemory = jobMemory;
  }

  executeRole(): JobResult {
    switch (this.jobCache.type) {
      case "TransferStructure":
        if (this.structure.structureType !== STRUCTURE_LINK) return "done";
        return new ILinkRole(
          this.structure as StructureLink,
          this.structureCache,
          this.structureMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      default:
        return "done";
    }
  }

  run(): void {
    const result = this.executeRole();
    const structureId = this.structure.id;
    switch (result) {
      case "done":
        IJobs.UnassignStructureJob(structureId, this.structureMemory, false);
        IJobs.Delete(this.structureMemory.jobId ?? "");
        break;
      case "empty":
        IJobs.UnassignStructureJob(structureId, this.structureMemory, false);
        break;
      case "full":
        IJobs.UnassignStructureJob(structureId, this.structureMemory, false);
        break;
      default:
        break;
    }
  }
}
