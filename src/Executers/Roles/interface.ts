import IBuildRole from "./build";
import IHarvestRole from "./harvest";
import IReserveControllerRole from "./reserveController";
import ITransferRole from "./transfer";
import IUpgradeControllerRole from "./upgradeController";
import IJobData from "../../Managers/BaseModels/Helper/Job/jobMemory";
import IJobs from "../../Managers/BaseModels/Jobs/interface";

interface IExecuteCreepRole {}

export default class implements IExecuteCreepRole {
  creep: Creep;
  creepCache: CreepCache;
  creepMemory: CreepMemory;
  jobCache: JobCache;
  jobMemory: JobMemory;
  constructor(
    creep: Creep,
    creepCache: CreepCache,
    creepMemory: CreepMemory,
    jobCache: JobCache,
    jobMemory: JobMemory
  ) {
    this.creep = creep;
    this.creepCache = creepCache;
    this.creepMemory = creepMemory;
    this.jobCache = jobCache;
    this.jobMemory = jobMemory;
  }

  executeRole():JobResult {
    switch (this.jobCache.type) {
      case "Build":
        return new IBuildRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      case "HarvestMineral":
      case "HarvestSource":
        return new IHarvestRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      case "ReserveController":
        return new IReserveControllerRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      case "TransferSpawn":
      case "TransferStructure":
        return new ITransferRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      case "UpgradeController":
        return new IUpgradeControllerRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
    }
  }

  run() {
    const result = this.executeRole();
    switch (result) {
        case "done":
            IJobs.UnassignCreepJob(this.creep,this.creepMemory);    
        IJobData.DeleteMemory(this.creepMemory.jobId ?? "",true,true);
            break;
        case "empty":
            case "full":
                IJobs.UnassignCreepJob(this.creep,this.creepMemory);    
                break;
        default:
            break;
    }
  }
}
