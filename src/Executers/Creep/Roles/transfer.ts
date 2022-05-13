import JobsHelper from "../../../Managers/BaseModels/Jobs/interface";

export default class CreepTransferResourceRole {
  protected _creepInformation: CreepInformation;

  constructor(creepInformation: CreepInformation) {
    this._creepInformation = creepInformation;
  }

  ExecuteTransferResourceRole(): JobResult {
    const creep = this._creepInformation.creep!;
    const resource: ResourceConstant = RESOURCE_ENERGY;
    const target = Game.getObjectById(
      this._creepInformation.jobMemory!.targetId
    ) as StructuresWithStorage | null;

    if (
      this._creepInformation.memory!.energyOutgoing[
        this._creepInformation.jobMemory!.targetId
      ] === 0 ||
      !this._creepInformation.memory!.energyOutgoing[
        this._creepInformation.jobMemory!.targetId
      ]
    )
      return "empty";

    if (target) {
      if (target.store.getFreeCapacity(resource) === 0) {
        return "done";
      }

      const amountToTransfer = Math.min(
        target.store.getFreeCapacity(resource),
        creep.store.energy
      );
      const result = creep.transfer(target, resource, amountToTransfer);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target);
          break;
        case ERR_FULL:
          return "done";
        case ERR_NOT_ENOUGH_RESOURCES:
          return "empty";
        case OK:
          JobsHelper.UpdateAmount(
            this._creepInformation.memory!.jobId as string,
            this._creepInformation.jobMemory!,
            this._creepInformation.jobCache!,
            amountToTransfer
          );
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
