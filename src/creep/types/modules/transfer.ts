export default class TransferCreepModule {
    public static Execute(creep: Creep, creepMem: CreepMemory, job: Job): void {
      const target = Game.getObjectById<Structure | null>(job.targetId);
  
      if (target) {
          if (creep.transfer(target,job.resourceType as ResourceConstant) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
          }
        }
    }
  }
  