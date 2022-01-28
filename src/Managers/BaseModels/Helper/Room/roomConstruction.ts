import IJobMemory from "../Job/jobMemory";

interface IRoomStructure {}

export default class implements IRoomStructure {
  static CreateConstructionSite(
    room: Room,
    pos: FreezedRoomPosition,
    type: BuildableStructureConstant,
    executer: string
  ): string | undefined {
    const result = room.createConstructionSite(pos.x, pos.y, type);
    if (result === OK) {
      const job = IJobMemory.Initialize({
        executer,
        pos,
        targetId: "",
        type: "Build",
        amountToTransfer: CONSTRUCTION_COST[type],
        structureType: type,
        objectType: "Creep",
      });
      if (job.success && job.cache && job.memory) {
        const jobId = IJobMemory.GetJobId(job.cache.type, job.memory.pos);
        return jobId;
      }
      return undefined;
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
