import { Mixin } from "ts-mixer";
import LinkRole from "./Roles/link";
import { StructuresWithRole } from "./constants";
import StructureJobs from "./jobs";
import CreepJobs from "../Creep/jobs";

export default class StructureRoles<S extends Structure> extends Mixin(
  LinkRole,
  StructureJobs
) {
  protected _structureInformation: StructureInformation<S>;

  constructor(structureInformation: StructureInformation<S>) {
    super(structureInformation);
    this._structureInformation = structureInformation;
  }

  private HandleRole(): JobResult {
    switch (this._structureInformation.jobCache!.type) {
      case "TransferStructure":
        if (
          this._structureInformation.structure!.structureType !== STRUCTURE_LINK
        )
          return "done";
        return this.ExecuteLink();
      default:
        return "done";
    }
  }

  protected ExecuteRole(): void {
    const structure = this._structureInformation.structure!;

    if (StructuresWithRole.includes(structure.structureType)) {
      const result = this.HandleRole();
      switch (result) {
        case "done":
          this.UnassignJob(false);
          CreepJobs.DeleteJobData(
            this._structureInformation.memory!.jobId ?? ""
          );
          break;
        case "empty":
          this.UnassignJob(false);
          break;
        case "full":
          this.UnassignJob(false);
          break;
        default:
          break;
      }
    }
  }
}
