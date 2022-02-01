import IStructureData from "../../Managers/BaseModels/Helper/Structure/structureMemory";
import ICreepData from "../../Managers/BaseModels/Helper/Creep/creepMemory";
import IJobData from "../../Managers/BaseModels/Helper/Job/jobMemory";

interface ICreepTransferRole {}

export default class implements ICreepTransferRole {
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
      this.jobMemory.targetId
    );
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
          {
            const targetMemoryResult = IStructureData.GetMemory(
              this.jobMemory.targetId
            );
            if (targetMemoryResult.success) {
              const targetMemory = targetMemoryResult.memory as StructureMemory;
              targetMemory.energyIncoming[
                this.jobMemory.fromTargetId as string
              ] -= amountToTransfer;
              this.creepMemory.energyOutgoing[
                this.jobMemory.targetId as string
              ] -= amountToTransfer;
              (this.jobMemory.amountToTransfer as number) -= amountToTransfer;

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
