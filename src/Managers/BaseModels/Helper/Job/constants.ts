export default class {
  static IncomingJobTypes: IncomingJobTypes[] = [
    "HarvestMineral",
    "HarvestSource",
    "WithdrawResource",
    "WithdrawStructure",
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
