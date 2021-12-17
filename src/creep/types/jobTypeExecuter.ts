import BuildCreepModule from "./modules/build";
import HarvestCreepModule from "./modules/harvest";
import RepairCreepModule from "./modules/repair";
import TransferCreepModule from "./modules/transfer";
import UpgradeCreepModule from "./modules/upgrade";
import WithdrawCreepModule from "./modules/withdraw";
import PioneerCreep from "./pioneer";

export default class JobTypeExecuter {
  public static Execute(creep: Creep, creepMem: CreepMemory, job: Job): void {
    switch (job.type) {
      case "build": {
        BuildCreepModule.Execute(creep, creepMem, job);
      }
      case "harvestMineral":
      case "harvestSource": {
        HarvestCreepModule.Execute(creep, creepMem, job);
      }
      case "pioneer":{
        PioneerCreep.Execute(creep, creepMem, job);
      }
      case "repair":{
        RepairCreepModule.Execute(creep, creepMem, job);
      }
      case "transferSpawning":
      case "transfer": {
        TransferCreepModule.Execute(creep, creepMem, job);
      }
      case "upgrade": {
        UpgradeCreepModule.Execute(creep, creepMem, job);
      }
      case "withdraw": {
        WithdrawCreepModule.Execute(creep, creepMem, job);
      }
    }
  }
}
