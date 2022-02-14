import LinkRole from "./link";
import Jobs from "../../../Managers/BaseModels/Jobs/interface";

export default class ExecuteCreepRole {
  private structure: Structure;

  private structureCache: StructureCache;

  private structureMemory: StructureMemory;

  private jobCache: JobCache;

  private jobMemory: JobMemory;

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

  private executeRole(): JobResult {
    switch (this.jobCache.type) {
      case "TransferStructure":
        if (this.structure.structureType !== STRUCTURE_LINK) return "done";
        return new LinkRole(
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

  private run(): void {
    const result = this.executeRole();
    const structureId = this.structure.id;
    switch (result) {
      case "done":
        Jobs.UnassignStructureJob(structureId, this.structureMemory, false);
        Jobs.Delete(this.structureMemory.jobId ?? "");
        break;
      case "empty":
        Jobs.UnassignStructureJob(structureId, this.structureMemory, false);
        break;
      case "full":
        Jobs.UnassignStructureJob(structureId, this.structureMemory, false);
        break;
      default:
        break;
    }
  }
}
