import IJobs from "../../../Managers/BaseModels/Jobs/interface";

export default class CreepTransferRole {
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
    const resource: ResourceConstant = RESOURCE_ENERGY;
    const target: StructuresWithStorage | null = Game.getObjectById(
      this.jobMemory.targetId
    );

    if (
      this.creepMemory.energyOutgoing[this.jobMemory.targetId] === 0 ||
      !this.creepMemory.energyOutgoing[this.jobMemory.targetId]
    )
      return "empty";

    if (target) {
      if (target.store.getFreeCapacity(resource) === 0) {
        return "done";
      }

      const amountToTransfer = Math.min(
        target.store.getFreeCapacity(resource),
        this.creep.store.energy
      );
      const result = this.creep.transfer(target, resource, amountToTransfer);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          this.creep.moveTo(target);
          break;
        case ERR_FULL:
          return "done";
        case ERR_NOT_ENOUGH_RESOURCES:
          return "empty";
        case OK:
          IJobs.UpdateAmount(
            this.creepMemory.jobId as string,
            this.jobMemory,
            this.jobCache,
            amountToTransfer
          );
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
