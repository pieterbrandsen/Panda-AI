import Jobs from "../../../Managers/BaseModels/Jobs/interface";

export default class CreepHarvestRole {
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
    if (
      this.creepCache.body.carry > 0 &&
      this.creep.store.getFreeCapacity() === 0
    ) {
      if (this.jobCache.type === "HarvestSource") {
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
      }
      return "full";
    }

    const target: Source | null = Game.getObjectById(this.jobMemory.targetId);
    if (target) {
      const result = this.creep.harvest(target);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          this.creep.moveTo(target);
          break;
        case OK:
          Jobs.UpdateAmount(
            this.creepMemory.jobId as string,
            this.jobMemory,
            this.jobCache,
            this.jobCache.type === "HarvestMineral"
              ? this.creepCache.body.work
              : this.creepCache.body.work * 2
          );
          break;
        // skip default case
      }
    }

    return "continue";
  }
}
