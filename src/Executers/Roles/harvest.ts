import IJobData from "../../Managers/BaseModels/Helper/Job/jobMemory";
import IResourceStorage from "../../Managers/BaseModels/ResourceStorage/interface";

interface ICreepHarvestRole {}

export default class implements ICreepHarvestRole {
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
    if (
      this.creepCache.body.carry > 0 &&
      this.creep.store.getFreeCapacity() === 0
    ) {
      if (this.jobCache.type === "HarvestSource") {
        new IResourceStorage(
          this.creep,
          "Creep",
          this.creepCache.executer
        ).Manage(false, true, 3);
        return "continue";
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
          if (this.jobCache.type === "HarvestMineral") {
            (this.jobMemory
              .amountToTransfer as number) -= this.creepCache.body.work;
            IJobData.UpdateMemory(
              this.creepMemory.jobId as string,
              this.jobMemory
            );
          }
          break;
        // skip default case
      }
    }

    return "continue";
  }
}
