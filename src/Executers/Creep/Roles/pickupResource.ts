import Jobs from "../../../Managers/BaseModels/Jobs/interface";

export default class CreepPickupResourceRole {
  protected _creepInformation: CreepInformation;

  constructor(creepInformation: CreepInformation) {
    this._creepInformation = creepInformation;
  }

  ExecutePickupResourceRole(): JobResult {
    const creep = this._creepInformation.creep!;
    const target = Game.getObjectById(
      this._creepInformation.jobMemory!.targetId ?? ""
    ) as Resource | null;
    if (
      this._creepInformation.memory!.energyIncoming[
        this._creepInformation.jobMemory!.targetId
      ] < 0 ||
      !this._creepInformation.memory!.energyIncoming[
        this._creepInformation.jobMemory!.targetId
      ]
    )
      return "full";

    if (target) {
      const resource: ResourceConstant = target.resourceType;
      if (target.amount === 0) {
        return "done";
      }

      const amountToWithdraw = Math.min(
        target.amount,
        creep.store.getFreeCapacity(resource)
      );
      const result = creep.pickup(target);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target);
          break;
        case ERR_FULL:
          return "full";
        case OK:
          Jobs.UpdateAmount(
            this._creepInformation.memory!.jobId ?? "",
            this._creepInformation.jobMemory!,
            this._creepInformation.jobCache!,
            amountToWithdraw
          );
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
