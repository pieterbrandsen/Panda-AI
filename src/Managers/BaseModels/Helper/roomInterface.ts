import IJobMemory from "./jobMemory";

interface IRoomHelper {}

export default class implements IRoomHelper {
  static GetExecuter(roomName: string, manager: ManagerTypes): string {
    return `${roomName}-${manager}`;
  }

  static GetRoomName(executer: string): string {
    const roomName = executer.split("-")[0];
    return roomName;
  }

  static GetManagerName(executer: string): string {
    return executer.split("-")[1];
  }

  static FreezeRoomPosition(pos: RoomPosition): FreezedRoomPosition {
    return {
      x: pos.x,
      y: pos.y,
      roomName: pos.roomName,
    };
  }

  static UnfreezeRoomPosition(pos: FreezedRoomPosition): RoomPosition {
    return new RoomPosition(pos.x, pos.y, pos.roomName);
  }

  static GetMiddlePosition(roomName: string): FreezedRoomPosition {
    return { x: 25, y: 25, roomName };
  }

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

  static GetStructuresAtLocation(
    room: Room,
    pos: FreezedRoomPosition,
    structureType: StructureConstant
  ): Structure | null {
    return room
      .lookForAt(LOOK_STRUCTURES, pos.x, pos.y)
      .filter((structure) => structure.structureType === structureType)[0];
  }
}
