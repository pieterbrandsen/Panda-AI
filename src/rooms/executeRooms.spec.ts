import { mockGlobal, mockInstanceOf } from "screeps-jest";
import DataMemoryInitializer from "../memory/dataInitialization";
import MemoryValidator from "../memory/validation";
import ExecuteRooms from "./executeRooms";
import MemoryInitializer from "../memory/initialization";
import { DefaultRoomMemory } from "../utils/constants/memory";
import MineralManager from "./managers/mineralManager/manager";
import GarbageCollection from "../memory/garbageCollection";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", { rooms: {}, creeps: {} }, true);
});
const roomName = "W1N1";
const room = mockInstanceOf<Room>({ name: roomName, controller: undefined });

describe("ExecuteRooms", () => {
  beforeEach(() => {
    Game.rooms = { [roomName]: room };

    MemoryInitializer.SetupRootMemory();
    DataMemoryInitializer.SetupRoomDataMemory = jest.fn().mockClear();
    MemoryInitializer.SetupRoomMemory = jest.fn().mockClear();
    MemoryValidator.IsMemoryValid = jest.fn().mockClear().mockReturnValue(true);

    GarbageCollection.CollectRoom = jest.fn().mockClear();
    MineralManager.Run = jest.fn().mockClear();
  });
  it("Should_SetupDataRoomMemory_When_NotMemoryNotValid", () => {
    // Arrange
    MemoryValidator.IsMemoryValid = jest
      .fn()
      .mockClear()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValue(true);

    // Act
    ExecuteRooms.ExecuteAll();
    ExecuteRooms.ExecuteAll();
    ExecuteRooms.ExecuteAll();

    // Assert
    expect(DataMemoryInitializer.SetupRoomDataMemory).toHaveBeenCalledTimes(2);
  });

  it("Should_ExecuteOwnedRoomManagers_WhenControllerIsOwned", () => {
    Memory.roomsData.data[roomName] = DefaultRoomMemory(roomName);
    // Arrange
    room.controller = mockInstanceOf<StructureController>({
      my: true,
    });

    // Act
    ExecuteRooms.ExecuteAll();

    // Assert
    expect(MineralManager.Run).toBeCalled();
  });
  it("Should_NotExecuteOwnedRoomManagers_WhenControllerIsNotOwned", () => {
    Memory.roomsData.data[roomName] = DefaultRoomMemory(roomName);
    // Arrange
    room.controller = mockInstanceOf<StructureController>({
      my: false,
    });

    // Act
    ExecuteRooms.ExecuteAll();

    // Assert
    expect(MineralManager.Run).not.toBeCalled();
  });
  it("Should_CallGarbageCollection_When_RoomIsNotVisible", () => {
    // Act
    Memory.roomsData.data.deadRoom = DefaultRoomMemory(roomName);

    // Arrange
    ExecuteRooms.ExecuteAll();

    // Assert
    expect(GarbageCollection.CollectRoom).toBeCalled();
  });
  it("Should_NotDoRoomStuff_When_ScoutIsUnderway", () => {
    // Arrange
    Memory.roomsData.data = { unseen: DefaultRoomMemory(roomName) };
    const memory = Memory.roomsData.data.unseen;
    memory.scout = { name: "scout" };
    Game.creeps[memory.scout.name] = mockInstanceOf<Creep>({});

    // Act
    ExecuteRooms.ExecuteAll();

    // Assert
    expect(GarbageCollection.CollectRoom).not.toBeCalled();
  });
});
