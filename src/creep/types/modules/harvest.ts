export default class HarvestCreepModule {
  public static Execute(
    creep: Creep,
    creepMem: CreepMemory,
    job: Job
  ): CreepModuleReturnCode {
    let target: Source | Mineral | null = null;
    if (job.type === "harvestSource") {
      target = Game.getObjectById<Source | null>(job.targetId);
    } else {
      target = Game.getObjectById<Mineral | null>(job.targetId);
    }

    if (target) {
      if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
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
