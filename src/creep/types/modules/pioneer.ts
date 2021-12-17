export default class PioneerCreepModule {
  public static Execute(
    creep: Creep,
    creepMem: CreepMemory,
    job: Job
  ): CreepModuleReturnCode {
    return "continue";
  }
}
