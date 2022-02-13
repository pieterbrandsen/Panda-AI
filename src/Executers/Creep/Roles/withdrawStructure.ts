import IJobs from "../../../Managers/BaseModels/Jobs/interface";

interface ICreepWithdrawStructureRole {}

export default class implements ICreepWithdrawStructureRole {
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
    const resource: ResourceConstant = RESOURCE_ENERGY;
    const target: StructuresWithStorage | null = Game.getObjectById(
      this.jobMemory.targetId ?? ""
    );
    if (
      this.creepMemory.energyIncoming[this.jobMemory.targetId] < 0 ||
      !this.creepMemory.energyIncoming[this.jobMemory.targetId]
    )
      return "full";
      
    if (target) {
      if (target.store.getUsedCapacity(resource) === 0) {
        return "done";
      }

      const amountToWithdraw = Math.min(
        target.store.getUsedCapacity(resource),
        this.creep.store.getFreeCapacity(resource)
      );
      const result = this.creep.withdraw(target, resource, amountToWithdraw);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          this.creep.moveTo(target);
          break;
        case ERR_FULL:
          return "full";
        case ERR_NOT_ENOUGH_RESOURCES:
          return "done";
        case OK:
          IJobs.UpdateAmount(
            this.creepMemory.jobId as string,
            this.jobMemory,
            this.jobCache,
            amountToWithdraw
          );
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
