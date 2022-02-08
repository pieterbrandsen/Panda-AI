import IResourceStorage from "../../../Managers/BaseModels/ResourceStorage/interface";
import IJobs from "../../../Managers/BaseModels/Jobs/interface";

interface ICreepUpgradeControllerRole {}

export default class implements ICreepUpgradeControllerRole {
  creep: Creep;

  creepCache: CreepCache;

  creepMemory: CreepMemory;

  jobCache: JobCache;

  jobMemory: JobMemory;

  constructor(
    creep: Creep,
    creepCache: CreepCache,
    creepMemory: CreepMemory,
    jobCache: JobCache,
    jobMemory: JobMemory
  ) {
    this.creep = creep;
    this.creepCache = creepCache;
    this.creepMemory = creepMemory;
    this.jobCache = jobCache;
    this.jobMemory = jobMemory;
  }

  run(): JobResult {
    if (this.creep.store.getUsedCapacity() === 0) {
      const closeStructure = new IResourceStorage(
        this.creep,
        "Creep",
        this.creepCache.executer
      ).Manage(true, false, false,5);
      if (!closeStructure) {
        return "empty";
      }
      if (Game.time % 25 === 0) return "empty";
      return "continue";
    }

    const target: StructureController | null = Game.getObjectById(
      this.jobMemory.targetId
    );
    if (target) {
      const result = this.creep.upgradeController(target);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          this.creep.moveTo(target);
          break;
        case OK:
          IJobs.UpdateAmount(
            this.creepMemory.jobId as string,
            this.jobMemory,
            this.jobCache,
            this.creepCache.body.work
          );
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
