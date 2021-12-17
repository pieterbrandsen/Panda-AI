export default class RepairCreepModule {
  public static Execute(
    creep: Creep,
    creepMem: CreepMemory,
    job: Job
  ): CreepModuleReturnCode {
    const structure = Game.getObjectById<Structure | null>(job.targetId);
    if (structure) {
      if (creep.repair(structure) === ERR_NOT_IN_RANGE) {
        creep.moveTo(structure);
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
