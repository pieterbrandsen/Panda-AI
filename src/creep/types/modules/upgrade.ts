export default class UpgradeCreepModule {
  public static Execute(creep: Creep, creepMem: CreepMemory, job: Job): void {
    const controller = Game.getObjectById<StructureController | null>(job.targetId);
    if (controller) {
      if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller);
      }
    }
  }
}
