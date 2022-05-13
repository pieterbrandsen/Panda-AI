import JobsHelper from "../../../Managers/BaseModels/Jobs/interface";
import Jobs from "../../../Managers/BaseModels/Jobs/interface";

export default class CreepUpgradeControllerRole {
  protected _creepInformation: CreepInformation;

  constructor(creepInformation: CreepInformation) {
    this._creepInformation = creepInformation;
  }

  ExecuteUpgradeControllerRole(): JobResult {
    const creep = this._creepInformation.creep!;
    if (creep.store.getUsedCapacity() === 0) {
      // const closeStructure = new IResourceStorage(
      //   this.creep,
      //   "Creep",
      //   this.creepCache.executer
      // ).Manage(true, false, false, true, 5);
      // if (!closeStructure) {
      //   return "empty";
      // }
      // if (Game.time % 25 === 0) return "empty";
      // return "continue";
      return "empty";
    }

    const target = Game.getObjectById(
      this._creepInformation.jobMemory!.targetId
    ) as StructureController | null;
    if (target) {
      const result = creep.upgradeController(target);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target);
          break;
        case OK:
          new JobsHelper().UpdateAmount(
            this._creepInformation.memory!.jobId as string,
            this._creepInformation.jobMemory!,
            this._creepInformation.jobCache!,
            this._creepInformation.cache!.body.work
          );
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
