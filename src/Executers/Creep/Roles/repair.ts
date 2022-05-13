import JobsHelper from "../../../Managers/BaseModels/Jobs/interface";

export default class CreepRepairRole {
  protected _creepInformation: CreepInformation;

  constructor(creepInformation: CreepInformation) {
    this._creepInformation = creepInformation;
  }

  ExecuteRepairRole(): JobResult {
    const creep = this._creepInformation.creep!;
    if (creep.store.getUsedCapacity() === 0) {
      return "empty";
    }
    const target = Game.getObjectById(
      this._creepInformation.jobMemory!.targetId
    ) as Structure | null;

    if ((this._creepInformation.jobMemory!.amountToTransfer ?? 0) <= 0) {
      return "done";
    }

    if (target) {
      const result = creep.repair(target);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target);
          break;
        case OK:
          new JobsHelper().UpdateAmount(
            this._creepInformation.memory!.jobId ?? "",
            this._creepInformation.jobMemory!,
            this._creepInformation.jobCache!,
            this._creepInformation.cache!.body.work * 100
          );
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
