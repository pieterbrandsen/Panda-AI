import IBuildRole from "./build";
import IRepairRole from "./repair";
import IHarvestRole from "./harvest";
import IReserveControllerRole from "./reserveController";
import ITransferRole from "./transfer";
import IWithdrawStructureRole from "./withdrawStructure";
import IWithdrawResourceRole from "./withdrawResource";
import IUpgradeControllerRole from "./upgradeController";
import IJobs from "../../../Managers/BaseModels/Jobs/interface";

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

  executeRole(): JobResult {
    switch (this.jobCache.type) {
      case "Build":
        return new IBuildRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      case "Repair":
        return new IRepairRole(
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
      case "WithdrawStructure":
        return new IWithdrawStructureRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      case "WithdrawResource":
        return new IWithdrawResourceRole(
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
      default:
        return "done";
    }
  }

  run(): void {
    const spendJobs: JobTypes[] = ["Build", "Repair", "UpgradeController"];
    // const gatherJobs: JobTypes[] = ["WithdrawResource","WithdrawStructure","HarvestMineral","HarvestSource"];
    const gatherJobs: JobTypes[] = ["HarvestMineral", "HarvestSource"];

    const result = this.executeRole();
    const creepId = this.creep.id;
    switch (result) {
      case "done":
        IJobs.Delete(this.creepMemory.jobId ?? "");
        break;
      case "empty":
        IJobs.UnassignCreepJob(
          creepId,
          this.creepMemory,
          spendJobs.includes(this.jobCache.type)
        );
        break;
      case "full":
        IJobs.UnassignCreepJob(
          creepId,
          this.creepMemory,
          gatherJobs.includes(this.jobCache.type)
        );
        break;
      default:
        break;
    }
  }
}
