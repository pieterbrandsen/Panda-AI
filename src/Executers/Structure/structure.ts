import { Mixin } from "ts-mixer";
import StructureData from "../../Managers/BaseModels/Helper/Structure/memory";
import StructureRepair from "./repair";
import StructureHeap from "../../Managers/BaseModels/Heap/structure";
import { StructuresWithRole } from "./constants";
import Jobs from "../../Managers/BaseModels/Jobs/interface";
import JobData from "../../Managers/BaseModels/Helper/Job/memory";
import StructureRoles from "./roles";

export default class StructureHandler<S extends Structure> extends Mixin(
  StructureData,
  StructureRepair,
  StructureRoles
) {
  public structureInformation: StructureInformation<S>;

  public IsStructureSetup(): boolean {
    if (
      this.structureInformation.structure &&
      this.structureInformation.cache &&
      this.structureInformation.memory
    )
      return true;
    return false;
  }

  public HasStructureAnJob(): boolean {
    if (
      this.structureInformation.jobCache &&
      this.structureInformation.jobMemory
    )
      return true;
    return false;
  }

  constructor(id: string, structure: S | null) {
    const structureInformation: StructureInformation<S> = { id, structure };
    super(structureInformation);

    const structureData = this.GetData();
    if (!structureData.success) {
      this.structureInformation = structureInformation;
      return;
    }
    const structureHeapData = this.GetHeap();
    if (!structureHeapData.success) {
      this.InitializeHeap();
    }

    structureInformation.cache = structureData.cache;
    structureInformation.memory = structureData.memory;
    if (
      !this.IsStructureSetup() ||
      structureInformation.memory!.jobId === undefined
    ) {
      if (structureData.memory)
        Jobs.UnassignStructureJob(id, structureData.memory, false);
      this.DeleteData(true, true);
      this.structureInformation = structureInformation;
      return;
    }

    const structureJobData = JobData.GetMemory(
      structureInformation.memory!.jobId
    );
    if (!structureJobData.success) {
      this.structureInformation = structureInformation;
      return;
    }

    structureInformation.jobCache = structureJobData.cache;
    structureInformation.jobMemory = structureJobData.memory;
    this.structureInformation = structureInformation;
  }

  public Execute(): void {
    if (!this.IsStructureSetup()) {
      return;
    }
    this.CreateRepairJobIfNeeded();

    if (this.HasStructureAnJob()) {
      this.ExecuteRole();
    }

    this.UpdateData(
      this.structureInformation.memory,
      this.structureInformation.cache
    );
  }

  public StructureData = StructureData;
}
