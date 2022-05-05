import { Mixin } from "ts-mixer";
import LinkRole from "./Roles/link";
import Jobs from "../../Managers/BaseModels/Jobs/interface";
import StructureHandler from "../../Managers/BaseModels/Heap/structure";
import { StructuresWithRole } from "./constants";

export default class StructureRoles<S extends Structure> extends Mixin(
  LinkRole
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
      const structureId = structure.id;
      const structureMemory = this._structureInformation.memory!;
      switch (result) {
        case "done":
          Jobs.UnassignStructureJob(structureId, structureMemory, false);
          Jobs.Delete(this._structureInformation.memory!.jobId ?? "");
          break;
        case "empty":
          Jobs.UnassignStructureJob(structureId, structureMemory, false);
          break;
        case "full":
          Jobs.UnassignStructureJob(structureId, structureMemory, false);
          break;
        default:
          break;
      }
    }
  }
}
