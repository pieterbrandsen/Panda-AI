import Jobs from "../../../Managers/BaseModels/Jobs/interface";

export default class CreepUpgradeControllerRole {
  private creep: Creep;

  private creepCache: CreepCache;

  private creepMemory: CreepMemory;

  private jobCache: JobCache;

  private jobMemory: JobMemory;

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
          Jobs.UpdateAmount(
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
