export default class RepairCreepModule {
    public static Execute(creep: Creep, creepMem: CreepMemory, job: Job): void {
      const structure = Game.getObjectById<Structure | null>(job.targetId);
      if (structure) {
        if (creep.repair(structure) === ERR_NOT_IN_RANGE) {
          creep.moveTo(structure);
        }
      }
    }
  }
  