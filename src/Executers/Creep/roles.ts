import { Mixin } from "ts-mixer";
import BuildRole from "./Roles/build";
import RepairRole from "./Roles/repair";
import HarvestRole from "./Roles/harvest";
import ReserveControllerRole from "./Roles/reserveController";
import TransferRole from "./Roles/transfer";
import WithdrawResourceRole from "./Roles/withdrawResource";
import PickupResourceRole from "./Roles/pickupResource";
import UpgradeControllerRole from "./Roles/upgradeController";
import Jobs from "../../Managers/BaseModels/Jobs/interface";

export default class CreepRoles extends Mixin(
  BuildRole,
  RepairRole,
  HarvestRole,
  ReserveControllerRole,
  TransferRole,
  WithdrawResourceRole,
  PickupResourceRole,
  UpgradeControllerRole
) {
  protected _creepInformation: CreepInformation;

  constructor(creepInformation: CreepInformation) {
    super(creepInformation);
    this._creepInformation = creepInformation;
  }

  private HandleRole(): JobResult {
    switch (this._creepInformation.jobCache!.type) {
      case "Build":
        return this.ExecuteBuilderRole();
      case "Repair":
        return this.ExecuteRepairRole();
      case "HarvestMineral":
      case "HarvestSource":
        return this.ExecuteHarvestRole();
      case "ReserveController":
        return this.ExecuteReserveControllerRole();
      case "TransferSpawn":
      case "TransferStructure":
        return this.ExecuteTransferResourceRole();
      case "WithdrawResource":
        return this.ExecuteWithdrawResource();
      case "PickupResource":
        return this.ExecutePickupResourceRole();
      case "UpgradeController":
        return this.ExecuteUpgradeControllerRole();
      default:
        return "done";
    }
  }

  ExecuteRole(): void {
    const spendJobs: JobTypes[] = ["Build", "Repair", "UpgradeController"];
    const gatherJobs: JobTypes[] = ["HarvestMineral", "HarvestSource"];

    const result = this.HandleRole();
    const creepId = this._creepInformation.id;
    switch (result) {
      case "done":
        Jobs.Delete(this._creepInformation.memory!.jobId ?? "");
        break;
      case "empty":
        Jobs.UnassignCreepJob(
          creepId,
          this._creepInformation.memory!,
          spendJobs.includes(this._creepInformation.jobCache!.type)
        );
        break;
      case "full":
        Jobs.UnassignCreepJob(
          creepId,
          this._creepInformation.memory!,
          gatherJobs.includes(this._creepInformation.jobCache!.type)
        );
        break;
      default:
        break;
    }
  }
}
