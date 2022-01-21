import IRoomCache from "../Cache/roomInterface";
import IJobs from "../Jobs/interface";

interface IRoomHelper {}

export default class implements IRoomHelper {
  static GetExecuter(roomName: string, manager: ManagerTypes): string {
    return `${roomName}-${manager}`;
  }

  static GetRoom(executer: string): SingleObject<RoomCache> {
    const roomName = executer.split("-")[0];
    const room = IRoomCache.Get(roomName);
    return { key: roomName, value: room.data };
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
      const job = IJobs.Initialize({
        executer,
        pos,
        targetId: "",
        type: "Build",
        amountToTransfer: CONSTRUCTION_COST[type],
      });
      return job;
    }
    return undefined;
  }
}
