export default class CreepReserveControllerRole {
  private creep: Creep;

  private creepCache: CreepCache;

  private creepMemory: CreepMemory;

  private jobCache: JobCache;

  private jobMemory: JobMemory;

  constructor(
    creep: Creep,
    creepCache: CreepCache,
    creepMemory: CreepMemory,
    jobCache: JobCache,
    jobMemory: JobMemory
  ) {
    this.creep = creep;
    this.creepCache = creepCache;
    this.creepMemory = creepMemory;
    this.jobCache = jobCache;
    this.jobMemory = jobMemory;
  }

  run(): JobResult {
    const target: StructureController | null = Game.getObjectById(
      this.jobMemory.targetId
    );
    if (target) {
      const result = this.creep.reserveController(target);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          this.creep.moveTo(target);
          break;
        case OK:
          break;
        // skip default case
      }
    }

    return "continue";
  }
}
