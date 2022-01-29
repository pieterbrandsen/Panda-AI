import IJobData from "../../Managers/BaseModels/Helper/Job/jobMemory";

interface ICreepBuilderRole {}

export default class implements ICreepBuilderRole {
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
          (this.jobMemory.amountToTransfer as number) -=
            this.creepCache.body.work * 1;
          IJobData.UpdateMemory(
            this.creepMemory.jobId as string,
            this.jobMemory
          );
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
