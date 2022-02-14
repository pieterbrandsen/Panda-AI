import JobData from "../Job/memory";

export default class RoomStructure {
  static CreateConstructionSite(
    room: Room,
    pos: FreezedRoomPosition,
    type: BuildableStructureConstant,
    executer: string
  ): string | undefined {
    const result = room.createConstructionSite(pos.x, pos.y, type);
    if (result === OK) {
      const job = JobData.Initialize({
        executer,
        pos,
        targetId: "",
        type: "Build",
        amountToTransfer: CONSTRUCTION_COST[type],
        structureType: type,
        objectType: "Creep",
      });
      if (job.success && job.cache && job.memory) {
        const jobId = JobData.GetJobId(job.cache.type, job.memory.pos);
        return jobId;
      }
      return undefined;
    }
    if (result === ERR_INVALID_TARGET) {
      const jobId = JobData.GetJobId("Build", pos);
      const jobData = JobData.GetMemory(jobId);
      if (
        jobData.success &&
        (jobData.memory as JobMemory).structureType === type
      )
        return jobId;
    }
    return undefined;
  }

  static GetCsSiteAtLocation(
    room: Room,
    pos: FreezedRoomPosition
  ): ConstructionSite | null {
    return room.lookForAt(LOOK_CONSTRUCTION_SITES, pos.x, pos.y)[0];
  }
}
