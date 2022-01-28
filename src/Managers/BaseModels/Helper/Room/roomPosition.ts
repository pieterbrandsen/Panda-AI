interface IRoomPosition {}

export default class implements IRoomPosition {
  static FreezeRoomPosition(pos: RoomPosition): FreezedRoomPosition {
    return {
      x: pos.x,
      y: pos.y,
      roomName: pos.roomName,
    };
  }

  static UnFreezeRoomPosition(pos: FreezedRoomPosition): RoomPosition {
    return new RoomPosition(pos.x, pos.y, pos.roomName);
  }

  static GetMiddlePosition(roomName: string): FreezedRoomPosition {
    return { x: 25, y: 25, roomName };
  }

  static GetNonWallPositionsAround(
    pos: FreezedRoomPosition,
    room: Room,
    maxDistance: number = 1
  ): number {
    const nonWallPositions = room
      .lookForAtArea(
        LOOK_TERRAIN,
        pos.y - maxDistance,
        pos.x - maxDistance,
        pos.y + maxDistance,
        pos.x + maxDistance,
        true
      )
      .filter(
        (terrain) =>
          terrain.terrain !== "wall" &&
          (terrain.x !== pos.x || terrain.y !== pos.y)
      );
    return nonWallPositions.length;
  }
}
