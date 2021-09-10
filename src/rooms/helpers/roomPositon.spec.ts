import { mockGlobal, mockInstanceOf } from "screeps-jest";
import RoomPositionHelper from "./roomPosition";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
});
const position = mockInstanceOf<RoomPosition>({ x: 1, y: 1, roomName: "room" });

describe("RoomPosition", () => {
  it("Should_FreezeRoomPosition_When_Called", () => {
    // Act
    const frozenPos = RoomPositionHelper.FreezeRoomPosition(position);

    // Assert
    expect(frozenPos.x).toBe(position.x);
    expect(frozenPos.y).toBe(position.y);
    expect(frozenPos.roomName).toBe(position.roomName);
  });
  it("Should_UnFreezeRoomPosition_When_Called", () => {
    // Arrange
    const frozenPos = position;

    // Act
    const roomPosition = RoomPositionHelper.UnfreezeRoomPosition(frozenPos);

    // Assert
    expect(roomPosition.x).toBe(frozenPos.x);
    expect(roomPosition.y).toBe(frozenPos.y);
    expect(roomPosition.roomName).toBe(frozenPos.roomName);
  });
  it("Should_ConvertRoomPositionToString_When_Called", () => {
    // Act
    const positionString = RoomPositionHelper.PositionToStringConverter(
      position
    );

    // Assert
    expect(positionString).toContain(position.x.toString());
    expect(positionString).toContain(position.y.toString());
    expect(positionString).toContain(position.roomName);
  });
});
