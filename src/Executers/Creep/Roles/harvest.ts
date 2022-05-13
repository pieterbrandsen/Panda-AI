import JobsHelper from "../../../Managers/BaseModels/Jobs/interface";

export default class CreepHarvestRole {
  protected _creepInformation: CreepInformation;

  constructor(creepInformation: CreepInformation) {
    this._creepInformation = creepInformation;
  }

  ExecuteHarvestRole(): JobResult {
    const creep = this._creepInformation.creep!;
    if (
      this._creepInformation.cache!.body.carry > 0 &&
      creep.store.getFreeCapacity() === 0
    ) {
      // if (this.jobCache.type === "HarvestSource") {
      // if (
      //   !new IResourceStorage(
      //     this.creep,
      //     "Creep",
      //     this.creepCache.executer
      //   ).Manage(false, true, false, true, 3)
      // ) {
      //   this.creep.drop(RESOURCE_ENERGY);
      // }
      // return "continue";
      // }
      return "full";
    }

    const target = Game.getObjectById(
      this._creepInformation.jobMemory!.targetId
    ) as Source | null;
    if (target) {
      const result = creep.harvest(target);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target);
          break;
        case OK:
          new JobsHelper().UpdateAmount(
            this._creepInformation.memory!.jobId as string,
            this._creepInformation.jobMemory!,
            this._creepInformation.jobCache!,
            this._creepInformation.jobCache!.type === "HarvestMineral"
              ? this._creepInformation.cache!.body.work
              : this._creepInformation.cache!.body.work * 2
          );
          break;
        // skip default case
      }
    }

    return "continue";
  }
}
