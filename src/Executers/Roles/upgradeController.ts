import IJobData from "../../Managers/BaseModels/Helper/Job/jobMemory";
import IResourceStorage from "../../Managers/BaseModels/ResourceStorage/interface";

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
      ).Manage(true, false, 5);
      if (!closeStructure) {
        new IResourceStorage(
          this.creep,
          "Creep",
          this.creepCache.executer
        ).Manage(true, false);
      }
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
          (this.jobMemory.amountToTransfer as number) -=
            this.creepCache.body.work * 2;
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
