export default class BuildCreepModule {
  public static Execute(creep: Creep, creepMem: CreepMemory, job: Job): void {
    const site = Game.getObjectById<ConstructionSite | null>(job.targetId);
    if (site) {
      if (creep.build(site) === ERR_NOT_IN_RANGE) {
        creep.moveTo(site);
      }
    }
  }
}
