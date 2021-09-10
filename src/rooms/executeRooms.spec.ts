import { mockGlobal, mockInstanceOf } from "screeps-jest";
import DataMemoryInitializer from "../memory/dataInitialization";
import MemoryValidator from "../memory/validation";
import ExecuteRooms from "./executeRooms";
import MemoryInitializer from "../memory/initialization";
import { DefaultRoomMemory } from "../utils/constants/memory";
import MineralManager from "./managers/mineralManager/manager";
import GarbageCollection from "../memory/garbageCollection";
import SpawnManager from "./managers/spawnManager/manager";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", { rooms: {}, creeps: {} }, true);

  DataMemoryInitializer.SetupRoomDataMemory = jest.fn();
  MemoryValidator.IsMemoryValid = jest.fn().mockReturnValue(true);

  GarbageCollection.CollectRoom = jest.fn();
  SpawnManager.Run = jest.fn();
  MineralManager.Run = jest.fn();
});
const roomName = "W1N1";
const room = mockInstanceOf<Room>({ name: roomName, controller: undefined });

describe("ExecuteRooms", () => {
  beforeEach(() => {
    Game.rooms = { [roomName]: room };
    MemoryInitializer.SetupRootMemory();
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
  });
  afterEach(() => {
    jest.clearAllMocks();
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
    expect(SpawnManager.Run).toBeCalled();
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
    Game.rooms = {};
    Memory.roomsData.data = { unseen: DefaultRoomMemory("unseen") };
    const memory = Memory.roomsData.data.unseen;
    memory.scout = { name: "scout" };
    Game.creeps[memory.scout.name] = mockInstanceOf<Creep>({});

    // Act
    ExecuteRooms.ExecuteAll();

    // Assert
    expect(GarbageCollection.CollectRoom).not.toBeCalled();
  });
});
