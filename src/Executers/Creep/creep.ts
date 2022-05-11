import { Mixin } from "ts-mixer";
import CreepHeapData from "../../Managers/BaseModels/Heap/creep";
import CreepData from "../../Managers/BaseModels/Helper/Creep/memory";
import JobData from "../../Managers/BaseModels/Helper/Job/memory";
import Jobs from "../../Managers/BaseModels/Jobs/interface";
import CreepRoles from "./roles";

export default class CreepHandler extends Mixin(CreepRoles) {
  public creepInformation: CreepInformation;
  public creepDataRepository:CreepData;
  public creepHeapDataRepository: { GetData: () => CRUDResult<CreepHeap>; CreateData: (data: CreepHeap) => CRUDResult<CreepHeap>; DeleteData: () => CRUDResult<CreepHeap>; UpdateData: (data: CreepHeap) => CRUDResult<CreepHeap>; InitializeData: () => CRUDResult<CreepHeap>; GenerateData: () => CreepHeap; };

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

    const creepDataRepository = new CreepData(id);
    const creepHeapDataRepository = creepDataRepository.HeapDataRepository;
    this.creepDataRepository = creepDataRepository;
    this.creepHeapDataRepository = creepHeapDataRepository;

    const creepData = creepDataRepository.GetData();
    if (!creepData.success) {
      this.creepInformation = creepInformation;
      return;
    }
    const creepHeapData = creepHeapDataRepository.GetData();
    if (!creepHeapData.success) {
      creepHeapDataRepository.InitializeData();
    }

    creepInformation.memory = creepData.memory;
    creepInformation.cache = creepData.cache;
    if (!this.IsCreepSetup() || creepInformation.memory!.jobId === undefined) {
      if (creepData.memory) Jobs.UnassignCreepJob(id, creepData.memory, false);
      creepDataRepository.DeleteData();
      creepHeapDataRepository.DeleteData();
      this.creepInformation = creepInformation;
      return;
    }

    const creepJobData = JobData.GetMemory(creepInformation.memory!.jobId);
    if (!creepJobData.success) {
      this.creepInformation = creepInformation;
      return;
    }

    creepInformation.jobCache = creepJobData.cache;
    creepInformation.jobMemory = creepJobData.memory;
    this.creepInformation = creepInformation;
  }

  Execute(): void {
    const creep = this.creepInformation.creep!;

    if (this.HasCreepAnJob()) {
      this.ExecuteRole();
    } else {
      Jobs.FindJobForCreep(creep);
    }

    this.creepDataRepository.UpdateData(this.creepInformation.memory as CreepMemory, this.creepInformation.cache as CreepCache);
  }
}
