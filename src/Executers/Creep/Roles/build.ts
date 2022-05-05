import Jobs from "../../../Managers/BaseModels/Jobs/interface";

export default class CreepBuilderRole {
  protected _creepInformation: CreepInformation;

  constructor(creepInformation: CreepInformation) {
    this._creepInformation = creepInformation;
  }

  ExecuteBuilderRole(): JobResult {
    const creep = this._creepInformation.creep!;
    if (creep.store.getUsedCapacity() === 0) {
      return "empty";
    }
    const target = Game.getObjectById(
      this._creepInformation.jobMemory!.targetId
    ) as ConstructionSite | null;
    if (target) {
      const result = creep.build(target);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target);
          break;
        case OK:
          Jobs.UpdateAmount(
            this._creepInformation.memory!.jobId ?? "",
            this._creepInformation.jobMemory!,
            this._creepInformation.jobCache!,
            this._creepInformation.cache!.body.work * 5
          );
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
