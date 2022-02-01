import ICreepData from "../../Managers/BaseModels/Helper/Creep/creepMemory";
import IJobData from "../../Managers/BaseModels/Helper/Job/jobMemory";

interface ICreepWithdrawResourceRole {}

export default class implements ICreepWithdrawResourceRole {
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
    const target: Resource | null = Game.getObjectById(
      this.jobMemory.targetId ?? ""
    );
    if (target) {
      const resource: ResourceConstant = target.resourceType;
      if (target.amount === 0) {
        return "done";
      }

      const amountToWithdraw = Math.min(
        target.amount,
        this.creep.store.getFreeCapacity(resource)
      );
      const result = this.creep.pickup(target);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          this.creep.moveTo(target);
          break;
        case ERR_FULL:
          return "full";
        case OK:
          this.creepMemory.energyIncoming[
            this.jobMemory.targetId as string
          ] -= amountToWithdraw;
          (this.jobMemory.amountToTransfer as number) -= amountToWithdraw;

          IJobData.UpdateMemory(
            this.creepMemory.jobId as string,
            this.jobMemory
          );
          ICreepData.UpdateMemory(this.creep.name, this.creepMemory);
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
