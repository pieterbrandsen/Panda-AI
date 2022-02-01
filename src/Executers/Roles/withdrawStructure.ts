import IStructureData from "../../Managers/BaseModels/Helper/Structure/structureMemory";
import ICreepData from "../../Managers/BaseModels/Helper/Creep/creepMemory";
import IJobData from "../../Managers/BaseModels/Helper/Job/jobMemory";

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
          {
            const targetMemoryResult = IStructureData.GetMemory(
              this.jobMemory.targetId
            );
            if (targetMemoryResult.success) {
              const targetMemory = targetMemoryResult.memory as StructureMemory;
              targetMemory.energyOutgoing[
                this.jobMemory.fromTargetId as string
              ] -= amountToWithdraw;
              this.creepMemory.energyIncoming[
                this.jobMemory.targetId as string
              ] -= amountToWithdraw;
              (this.jobMemory.amountToTransfer as number) -= amountToWithdraw;

              IJobData.UpdateMemory(
                this.creepMemory.jobId as string,
                this.jobMemory
              );
              ICreepData.UpdateMemory(this.creep.name, this.creepMemory);
              IStructureData.UpdateMemory(target.id, targetMemory);
            }
          }
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
