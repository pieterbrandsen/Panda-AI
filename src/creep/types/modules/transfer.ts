export default class TransferCreepModule {
  public static Execute(
    creep: Creep,
    creepMem: CreepMemory,
    job: Job
  ): CreepModuleReturnCode {
    const target = Game.getObjectById<Structure | null>(job.targetId);

    if (target) {
      const result = creep.transfer(
        target,
        job.resourceType as ResourceConstant
      );
      switch (result) {
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target);
          break;
        case ERR_FULL:
          return "done";
        default:
          break;
      }
    } else {
      return "done";
    }

    if (creep.store.getUsedCapacity() === 0) {
      return "empty";
    }
    return "continue";
  }
}
