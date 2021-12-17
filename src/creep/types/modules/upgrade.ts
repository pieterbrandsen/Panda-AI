export default class UpgradeCreepModule {
  public static Execute(
    creep: Creep,
    creepMem: CreepMemory,
    job: Job
  ): CreepModuleReturnCode {
    const controller = Game.getObjectById<StructureController | null>(
      job.targetId
    );
    if (controller) {
      if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller);
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
