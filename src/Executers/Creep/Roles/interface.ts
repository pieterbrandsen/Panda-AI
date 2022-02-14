import BuildRole from "./build";
import RepairRole from "./repair";
import HarvestRole from "./harvest";
import ReserveControllerRole from "./reserveController";
import TransferRole from "./transfer";
import WithdrawStructureRole from "./withdrawStructure";
import WithdrawResourceRole from "./withdrawResource";
import UpgradeControllerRole from "./upgradeController";
import Jobs from "../../../Managers/BaseModels/Jobs/interface";

export default class ExecuteCreepRole {
  private creep: Creep;

  private creepCache: CreepCache;

  private creepMemory: CreepMemory;

  private jobCache: JobCache;

  private jobMemory: JobMemory;

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

  private executeRole(): JobResult {
    switch (this.jobCache.type) {
      case "Build":
        return new BuildRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      case "Repair":
        return new RepairRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      case "HarvestMineral":
      case "HarvestSource":
        return new HarvestRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      case "ReserveController":
        return new ReserveControllerRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      case "TransferSpawn":
      case "TransferStructure":
        return new TransferRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      case "WithdrawStructure":
        return new WithdrawStructureRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      case "WithdrawResource":
        return new WithdrawResourceRole(
          this.creep,
          this.creepCache,
          this.creepMemory,
          this.jobCache,
          this.jobMemory
        ).run();
      case "UpgradeController":
        return new UpgradeControllerRole(
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
        Jobs.Delete(this.creepMemory.jobId ?? "");
        break;
      case "empty":
        Jobs.UnassignCreepJob(
          creepId,
          this.creepMemory,
          spendJobs.includes(this.jobCache.type)
        );
        break;
      case "full":
        Jobs.UnassignCreepJob(
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
