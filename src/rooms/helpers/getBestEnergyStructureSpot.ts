import { forEach } from "lodash";
import RoomPositionHelper from "./roomPosition";

export default class EnergyStructurePositioningHelper {
  /**
   * Return an optimal position for a structure to be built.
   * @param room - The room to search for a position in.
   * @param source - The source to build the structure for.
   * @param structureType - The structureType to build.
   * @returns - An RoomPosition
   */
  public static GetBestStructureSpot(
    room: Room,
    pos: FreezedRoomPosition,
    structureType: STRUCTURE_CONTAINER | STRUCTURE_LINK,
    managerName:ManagerNames = "source"
  ): RoomPosition {
    const sourcePos = RoomPositionHelper.UnfreezeRoomPosition(pos);
    const range = managerName === "controller" ? 3 : structureType === STRUCTURE_LINK ? 2 : 1;

    let roomPositions: RoomPosition[] = [];
    for (let i = -range; i <= range; i += 1) {
      roomPositions.push(
        new RoomPosition(
          sourcePos.x + i,
          sourcePos.y + range,
          sourcePos.roomName
        )
      );
      roomPositions.push(
        new RoomPosition(
          sourcePos.x + i,
          sourcePos.y - range,
          sourcePos.roomName
        )
      );
      if (Math.abs(i) !== range) {
        roomPositions.push(
          new RoomPosition(
            sourcePos.x + range,
            sourcePos.y + i,
            sourcePos.roomName
          )
        );
        roomPositions.push(
          new RoomPosition(
            sourcePos.x - range,
            sourcePos.y + i,
            sourcePos.roomName
          )
        );
      }
    }
    roomPositions = roomPositions.filter(
      (pos) => pos.lookFor(LOOK_TERRAIN)[0] !== "wall"
    );

    let bestWeight = 0;
    let bestPos: RoomPosition | undefined;
    forEach(roomPositions, (pos) => {
      const terrainAroundPos = room
        .lookForAtArea(
          LOOK_TERRAIN,
          pos.y - 1,
          pos.x - 1,
          pos.y + 1,
          pos.x + 1,
          true
        )
        .filter(
          (terrain) =>
            terrain.terrain !== "wall" &&
            (terrain.x !== pos.x || terrain.y !== pos.y)
        );
      const weight = terrainAroundPos.length;
      if (weight > bestWeight) {
        bestWeight = weight;
        bestPos = pos;
      }
    });

    return bestPos as RoomPosition;
  }
}
