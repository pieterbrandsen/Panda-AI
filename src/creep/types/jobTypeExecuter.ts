import GarbageCollection from "../../memory/garbageCollection";
import JobDeleteHelper from "../../rooms/jobs/delete";
import BuildCreepModule from "./modules/build";
import HarvestCreepModule from "./modules/harvest";
import PioneerCreepModule from "./modules/pioneer";
import RepairCreepModule from "./modules/repair";
import TransferCreepModule from "./modules/transfer";
import UpgradeCreepModule from "./modules/upgrade";
import WithdrawCreepModule from "./modules/withdraw";

export default class JobTypeExecuter {
  public static Execute(creep: Creep, creepMem: CreepMemory, job: Job): void {
    let returnCode: CreepModuleReturnCode = "continue";
    
    switch (job.type) {
      case "build": {
        returnCode = BuildCreepModule.Execute(creep, creepMem, job);
      }
      case "harvestMineral":
      case "harvestSource": {
        returnCode = HarvestCreepModule.Execute(creep, creepMem, job);
      }
      case "repair": {
        returnCode = RepairCreepModule.Execute(creep, creepMem, job);
      }
      case "transferSpawning":
      case "transfer": {
        returnCode = TransferCreepModule.Execute(creep, creepMem, job);
      }
      case "upgrade": {
        returnCode = UpgradeCreepModule.Execute(creep, creepMem, job);
      }
      case "withdraw": {
        returnCode = WithdrawCreepModule.Execute(creep, creepMem, job);
      }
    }

    if (returnCode === "continue" && job.amountLeft <= 0 || returnCode === "done") {
      JobDeleteHelper.Delete(job,creepMem.manager)
    }

    if (returnCode !== "continue") {
      creepMem.job = undefined;
    }
  }
}
