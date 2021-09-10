export default class JobAssignmentsHelper {
  /**
   * Assign an forced job to an creep or structure
   * @param memory - Creep or structure memory
   * @param job - Job to assign
   * @param roomName - Name of the room
   */
  public static AssignJob(
    memory: CreepMemory | StructureMemory,
    job: Job,
    roomName: string
  ): void {
    memory.job = { id: job.id, roomName };
    job.latestStructureOrCreepAssignedAtTick = Game.time;
  }
}
