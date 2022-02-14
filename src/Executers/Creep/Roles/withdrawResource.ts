import Jobs from "../../../Managers/BaseModels/Jobs/interface";

export default class CreepWithdrawResourceRole {
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
    const target: Resource | null = Game.getObjectById(
      this.jobMemory.targetId ?? ""
    );
    if (
      this.creepMemory.energyIncoming[this.jobMemory.targetId] < 0 ||
      !this.creepMemory.energyIncoming[this.jobMemory.targetId]
    )
      return "full";

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
          Jobs.UpdateAmount(
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
