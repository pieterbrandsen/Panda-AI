export default class JobAssignmentsHelper {
  /**
   * Assign an forced job to an creep or structure
   * @param memory - Creep or structure memory
   * @param job - Job to assign
   */
  public static AssignJob(
    memory: CreepMemory | StructureMemory,
    job: Job
  ): void {
    memory.job = { id: job.id };
    job.latestStructureOrCreepAssignedAtTick = Game.time;
  }
}
