import { mockGlobal, mockInstanceOf } from "screeps-jest";
import DataMemoryInitializer from "../memory/dataInitialization";
import MemoryValidator from "../memory/validation";
import ExecuteRooms from "./executeRooms";
import MemoryInitializer from "../memory/initialization";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
});

describe("ExecuteRooms", () => {
  beforeEach(() => {
    Game.rooms = {};
    MemoryInitializer.SetupRootMemory();
    DataMemoryInitializer.SetupRoomDataMemory = jest.fn().mockClear();
    MemoryInitializer.SetupRoomMemory = jest.fn().mockClear();
    MemoryValidator.IsMemoryValid = jest.fn().mockClear().mockReturnValue(true);
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
  it("Should_SetupRoomMemory_When_NotDefined", () => {
    // Arrange
    Game.rooms.W1N1 = mockInstanceOf<Room>({ name: "W1N1" });

    // Act
    ExecuteRooms.ExecuteAll();

    // Assert
    expect(MemoryInitializer.SetupRoomMemory).toHaveBeenCalledTimes(1);
  });
  it("Should_NotSetupRoomMemory_When_Defined", () => {
    // Arrange
    Memory.roomsData.data.W1N1 = {};
    Game.rooms.W1N1 = mockInstanceOf<Room>({ name: "W1N1" });

    // Act
    ExecuteRooms.ExecuteAll();

    // Assert
    expect(MemoryInitializer.SetupRoomMemory).toHaveBeenCalledTimes(0);
  });
});
