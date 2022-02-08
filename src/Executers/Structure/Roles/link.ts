import IJobs from "../../../Managers/BaseModels/Jobs/interface";

interface ICreepTransferRole {}

export default class implements ICreepTransferRole {
    structure: StructureLink;

  cache: StructureCache;

  memory: StructureMemory;

  jobCache: JobCache;

  jobMemory: JobMemory;

  constructor(
    structure: StructureLink,
    cache: StructureCache,
    memory: StructureMemory,
    jobCache: JobCache,
    jobMemory: JobMemory
  ) {
    this.structure = structure;
    this.cache = cache;
    this.memory = memory;
    this.jobCache = jobCache;
    this.jobMemory = jobMemory;
  }

  run(): JobResult {
    const target: StructureLink | null = Game.getObjectById(
      this.jobMemory.targetId
    );
    const from: StructureLink | null = Game.getObjectById(
        this.jobMemory.fromTargetId ?? ""
      );
    if (from && target) {
        const resource = RESOURCE_ENERGY;
      const amountToTransfer = Math.min(
        target.store.getFreeCapacity(resource),
        this.structure.store.energy
      );
      if (target.store.getUsedCapacity(resource) === 0 || amountToTransfer <= 0) {
        return "done";
      }

      const result = this.structure.transferEnergy(target, amountToTransfer);
      switch (result) {
        case ERR_FULL:
          return "done";
        case ERR_NOT_ENOUGH_RESOURCES:
          return "empty";
        case OK:
          IJobs.UpdateAmount(
            this.memory.jobId as string,
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
