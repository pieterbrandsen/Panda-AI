import JobsHelper from "../../../Managers/BaseModels/Jobs/interface";

export default class CreepWithdrawResourceRole {
  protected _creepInformation: CreepInformation;

  constructor(creepInformation: CreepInformation) {
    this._creepInformation = creepInformation;
  }

  ExecuteWithdrawResource(): JobResult {
    const creep = this._creepInformation.creep!;
    const resource: ResourceConstant = RESOURCE_ENERGY;
    const target = Game.getObjectById(
      this._creepInformation.jobMemory!.targetId
    ) as StructuresWithStorage | null;
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
      if (target.store.getUsedCapacity(resource) === 0) {
        return "done";
      }

      const amountToWithdraw = Math.min(
        target.store.getUsedCapacity(resource),
        creep.store.getFreeCapacity(resource)
      );
      const result = creep.withdraw(target, resource, amountToWithdraw);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target);
          break;
        case ERR_FULL:
          return "full";
        case ERR_NOT_ENOUGH_RESOURCES:
          return "done";
        case OK:
          new JobsHelper().UpdateAmount(
            this._creepInformation.memory!.jobId as string,
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
