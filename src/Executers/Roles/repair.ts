import IJobs from "../../Managers/BaseModels/Jobs/interface";

interface ICreepRepairRole {}

export default class implements ICreepRepairRole {
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
    const target: Structure | null = Game.getObjectById(
      this.jobMemory.targetId
    );
    if (target) {
      const result = this.creep.repair(target);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          this.creep.moveTo(target);
          break;
        case OK:
          IJobs.UpdateAmount(
            this.creepMemory.jobId as string,
            this.jobMemory,
            this.jobCache,
            this.creepCache.body.work * 100
          );
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
