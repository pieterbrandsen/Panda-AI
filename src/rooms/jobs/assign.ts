export default class JobAssignmentsHelper {
  /**
   * Assign an forced job to an creep or structure
   * @param memory - Creep or structure memory
   * @param job - Job to assign
   * @param roomName - Name of the room
   */
  public static AssignJob(
    memory: CreepMemory | StructureMemory,
    job: Job | null,
    roomName: string
  ): boolean {
    if (job === null) {
      switch ((memory as CreepMemory).creepType) { 
        default: return false
      } 
      return true
    }
    memory.job = { id: job.id, roomName };
    job.latestStructureOrCreepAssignedAtTick = Game.time;
    return true
  }
  public static FindAndAssignStructureJob(
    memory: StructureMemory,
    type: StructureConstant,
    roomName: string
  ):boolean {
    return false
  }
}
