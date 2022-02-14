import Jobs from "../../../Managers/BaseModels/Jobs/interface";

export default class CreepBuilderRole {
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
      return "empty";
    }
    const target: ConstructionSite | null = Game.getObjectById(
      this.jobMemory.targetId
    );
    if (target) {
      const result = this.creep.build(target);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          this.creep.moveTo(target);
          break;
        case OK:
          Jobs.UpdateAmount(
            this.creepMemory.jobId as string,
            this.jobMemory,
            this.jobCache,
            this.creepCache.body.work * 5
          );
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
