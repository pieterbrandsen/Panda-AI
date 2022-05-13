import { Mixin } from "ts-mixer";
import CreepData from "../../Managers/BaseModels/Helper/Creep/memory";
import JobData from "../../Managers/BaseModels/Helper/Job/memory";
import CreepJobs from "./jobs";
import CreepRoles from "./roles";

export default class CreepHandler extends Mixin(CreepRoles, CreepJobs) {
  public creepInformation: CreepInformation;

  public creepDataRepo: CreepData;

  public IsCreepSetup(): boolean {
    if (
      this.creepInformation.creep &&
      this.creepInformation.cache &&
      this.creepInformation.memory
    )
      return true;
    return false;
  }

  public HasCreepAnJob(): boolean {
    if (this.creepInformation.jobCache && this.creepInformation.jobMemory)
      return true;
    return false;
  }

  constructor(id: string, creep: Creep | null) {
    const creepInformation: CreepInformation = { id, creep };
    super(creepInformation);

    this.creepDataRepo = new CreepData(id);
    const creepData = this.creepDataRepo.GetData();
    if (!creepData.success) {
      this.creepInformation = creepInformation;
      return;
    }
    const creepHeapData = this.creepDataRepo.GetHeapData();
    if (!creepHeapData.success) {
      this.creepDataRepo.InitializeHeapData();
    }

    creepInformation.memory = creepData.memory;
    creepInformation.cache = creepData.cache;
    if (!this.IsCreepSetup() || creepInformation.memory!.jobId === undefined) {
      if (creepData.memory) this.UnassignJob(false);
      this.creepDataRepo.DeleteData();
      this.creepDataRepo.DeleteHeapData();
      this.creepInformation = creepInformation;
      return;
    }

    const creepJobData = new JobData(creepInformation.memory!.jobId).GetData();
    if (!creepJobData.success) {
      this.creepInformation = creepInformation;
      return;
    }

    creepInformation.jobCache = creepJobData.cache;
    creepInformation.jobMemory = creepJobData.memory;
    this.creepInformation = creepInformation;
  }

  Execute(): void {
    if (this.HasCreepAnJob()) {
      this.ExecuteRole();
    } else {
      this.FindJobForCreep();
    }

    this.creepDataRepo.UpdateData(
      this.creepInformation.memory as CreepMemory,
      this.creepInformation.cache as CreepCache
    );
  }
}
