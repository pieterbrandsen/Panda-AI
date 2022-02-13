import { forEach, reduce } from "lodash";

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
    maxDistance = 1
  ): RoomPosition[] {
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

    return nonWallPositions.map(
      (terrain) => new RoomPosition(terrain.x, terrain.y, room.name)
    );
  }

  static FindBestPosInRange(
    room: Room,
    targetPos: RoomPosition,
    range: number,
    type: "source" | "controller"
  ): RoomPosition | undefined {
    const nonWallPositionsAroundTarget = this.GetNonWallPositionsAround(
      targetPos,
      room,
      range
    );
    const adjacentPositions = this.GetNonWallPositionsAround(
      targetPos,
      room,
      1
    );

    let bestPos: RoomPosition | undefined;
    let bestPosScore = 0;

    forEach(nonWallPositionsAroundTarget, (pos) => {
      if (type === "source") {
        const adjacentPositionsRangeScore = reduce(
          adjacentPositions,
          (sum, adjacentPosition) => {
            return sum + adjacentPosition.getRangeTo(pos);
          },
          0
        );

        if (adjacentPositionsRangeScore < bestPosScore || bestPosScore === 0) {
          bestPos = pos;
          bestPosScore = adjacentPositionsRangeScore;
        }
      } else if (type === "controller") {
        const adjacentPositionsRangeScore = this.GetNonWallPositionsAround(
          pos,
          room,
          1
        ).length;
        if (adjacentPositionsRangeScore > bestPosScore || bestPosScore === 0) {
          bestPos = pos;
          bestPosScore = adjacentPositionsRangeScore;
        } else if (adjacentPositionsRangeScore === bestPosScore && bestPos) {
          if (
            pos.getRangeTo(targetPos) <
            (bestPos as RoomPosition).getRangeTo(targetPos)
          ) {
            bestPos = pos;
            bestPosScore = adjacentPositionsRangeScore;
          }
        }
      }
    });

    return bestPos;
  }
}
