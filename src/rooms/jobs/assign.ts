export default class JobAssignments {
  public static AssignNewJob(memory: CreepMemory|StructureMemory,job:Job):void {
    if (memory.checkForNewJobAtTick && memory.checkForNewJobAtTick >= Game.time) return;
      memory.job = {id: job.id};
      job.latestStructureOrCreepAssignedAtTick = Game.time;
  }
}