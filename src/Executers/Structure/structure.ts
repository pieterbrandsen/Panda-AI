import { Mixin } from "ts-mixer";
import StructureData from "../../Managers/BaseModels/Helper/Structure/memory";
import StructureRepair from "./repair";
import JobData from "../../Managers/BaseModels/Helper/Job/memory";
import StructureRoles from "./roles";
import StructureJobs from "./jobs";

export default class StructureHandler<S extends Structure> extends Mixin(
  StructureRepair,
  StructureRoles,
  StructureJobs
) {
  public structureInformation: StructureInformation<S>;

  public structureDataRepo: StructureData;

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
    super({ id, structure });
    const structureInformation: StructureInformation<S> = { id, structure };
    this.structureDataRepo = new StructureData(id);

    const structureData = this.structureDataRepo.GetData();
    if (!structureData.success) {
      this.structureInformation = structureInformation;
      return;
    }
    const structureHeapData = this.structureDataRepo.HeapDataRepository.GetData();
    if (!structureHeapData.success) {
      this.structureDataRepo.HeapDataRepository.InitializeData();
    }

    structureInformation.cache = structureData.cache;
    structureInformation.memory = structureData.memory;
    if (
      !this.IsStructureSetup() ||
      structureInformation.memory!.jobId === undefined
    ) {
      if (structureData.memory) this.UnassignJob(false);
      this.structureDataRepo.DeleteData();
      this.structureInformation = structureInformation;
      return;
    }

    const structureJobData = new JobData(
      structureInformation.memory!.jobId
    ).GetData();
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

    this.structureDataRepo.UpdateData(
      this.structureInformation.memory as StructureMemory,
      this.structureInformation.cache as StructureCache
    );
  }

  public StructureData = StructureData;
}
