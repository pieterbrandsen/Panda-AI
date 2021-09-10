import { mockGlobal, mockInstanceOf } from "screeps-jest";
import DataMemoryInitializer from "../../memory/dataInitialization";
import MemoryInitializer from "../../memory/initialization";
import { DefaultRoomMemory } from "../../utils/constants/memory";
import UpdateRoomCache from "./rooms";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", { rooms: {} }, true);
  MemoryInitializer.SetupRootMemory();
});
const room = mockInstanceOf<Room>({
  name: "room",
  find: jest.fn().mockReturnValue([]),
});

describe("RoomCacheUpdater", () => {
  beforeEach(() => {
    Game.rooms = {};
    Memory.garbageData = {};
    DataMemoryInitializer.SetupRoomDataMemory();
  });
  it("Should_AddNewVisibleRooms_When_NotInCache", () => {
    // Arrange
    Game.rooms[room.name] = room;

    // Act
    UpdateRoomCache();

    // Assert
    expect(Object.keys(Memory.roomsData.data)).toHaveLength(1);
  });
  it("Should_RemoveRooms_When_NotVisibleAndNoScout", () => {
    // Arrange
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);

    // Act
    UpdateRoomCache();

    // Assert
    expect(Object.keys(Memory.roomsData.data)).toHaveLength(0);
    expect(Object.keys(Memory.garbageData)).toHaveLength(1);
  });
  it("Should_NotRemoveRooms_When_NotVisibleAndWithScout", () => {
    // Arrange
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
    Memory.roomsData.data[room.name].scout = { name: "scout" };

    // Act
    UpdateRoomCache();

    // Assert
    expect(Object.keys(Memory.roomsData.data)).toHaveLength(1);
    expect(Object.keys(Memory.garbageData)).toHaveLength(0);
  });
  it("Should_DoNothing_When_VisibleAndInCache", () => {
    // Arrange
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
    Game.rooms[room.name] = room;

    // Act
    UpdateRoomCache();

    // Assert
    expect(Object.keys(Memory.roomsData.data)).toHaveLength(1);
    expect(Object.keys(Memory.garbageData)).toHaveLength(0);
  });
});
