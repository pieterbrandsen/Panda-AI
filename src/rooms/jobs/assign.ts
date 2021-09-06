export default class JobAssignments {
  /**
   * Assign an forced job to an creep or structure
   * @param memory - Creep or structure memory
   * @param job - Job to assign
   */
  public static AssignNewJob(
    memory: CreepMemory | StructureMemory,
    job: Job
  ): void {
    if (memory.checkForNewJobAtTick && memory.checkForNewJobAtTick >= Game.time)
      return;
    memory.job = { id: job.id };
    job.latestStructureOrCreepAssignedAtTick = Game.time;
  }
}
