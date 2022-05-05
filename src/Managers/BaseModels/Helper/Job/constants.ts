export default class JobConstants {
  static IncomingJobTypes: IncomingJobTypes[] = [
    "HarvestMineral",
    "HarvestSource",
    "WithdrawResource",
    "PickupResource",
  ];

  static OutgoingJobTypes: OutgoingJobTypes[] = [
    "Build",
    "Repair",
    "TransferSpawn",
    "TransferStructure",
    "UpgradeController",
  ];

  static OtherJobTypes: OtherJobTypes[] = ["ReserveController"];
}
