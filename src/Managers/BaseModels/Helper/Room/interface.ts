export default class RoomHelper {
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

  static GetStructureAtLocation(
    room: Room,
    pos: FreezedRoomPosition,
    structureType: StructureConstant
  ): Structure | null {
    return room
      .lookForAt(LOOK_STRUCTURES, pos.x, pos.y)
      .filter((structure) => structure.structureType === structureType)[0];
  }
}
