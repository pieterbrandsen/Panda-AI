export default class WithdrawCreepModule {
  public static Execute(
    creep: Creep,
    creepMem: CreepMemory,
    job: Job
  ): CreepModuleReturnCode {
    const target = Game.getObjectById<Structure | null>(job.targetId);

    if (target) {
      const result = creep.withdraw(
        target,
        job.resourceType as ResourceConstant
      );
      switch (result) {
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target);
          break;
        case ERR_NOT_ENOUGH_RESOURCES:
          return "done";
        default:
          break;
      }
    } else {
      return "done";
    }

    if (creep.store.getFreeCapacity() === 0) {
      return "full";
    }
    return "continue";
  }
}
