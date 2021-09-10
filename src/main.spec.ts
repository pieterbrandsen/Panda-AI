import { mockGlobal } from "screeps-jest";
import HeapInitializer from "./heap/initialization";
import HeapValidator from "./heap/validation";
import { loop } from "./main";
import GarbageCollection from "./memory/garbageCollection";
import MemoryInitializer from "./memory/initialization";
import MemoryValidator from "./memory/validation";
import ExecuteRooms from "./rooms/executeRooms";

beforeAll(() => {
  mockGlobal<Memory>("Memory", { version: 0 });
  mockGlobal<Game>("Game", { rooms: {} }, true);
});
ExecuteRooms.ExecuteAll = jest.fn().mockReturnValue(true);
GarbageCollection.Check = jest.fn().mockReturnValue(true);

describe("Main", () => {
  beforeEach(() => {
    MemoryValidator.IsMemoryValid = jest.fn().mockReturnValue(true);
    MemoryInitializer.SetupRootMemory = jest.fn().mockReturnValue(true);

    HeapValidator.IsHeapValid = jest.fn().mockReturnValue(true);
    HeapInitializer.SetupHeap = jest.fn().mockReturnValue(true);
  });
  it("Should_SetupRootRoomMemory_When_NotValid", () => {
    // Arrange
    MemoryValidator.IsMemoryValid = jest
      .fn()
      .mockClear()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValue(true);

    // Act
    loop();
    loop();
    loop();

    // Assert
    expect(MemoryInitializer.SetupRootMemory).toHaveBeenCalledTimes(2);
  });
  it("Should_SetupHeapRoomMemory_When_NotValid", () => {
    // Arrange
    HeapValidator.IsHeapValid = jest
      .fn()
      .mockClear()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValue(true);

    // Act
    loop();
    loop();
    loop();

    // Assert
    expect(HeapInitializer.SetupHeap).toHaveBeenCalledTimes(2);
  });
  it("Should_CallFunctions_When_Heap&MemoryAreValid", () => {
    // Arrange

    // Act
    loop();

    // Assert
    expect(MemoryValidator.IsMemoryValid).lastReturnedWith(true);
    expect(HeapValidator.IsHeapValid).lastReturnedWith(true);

    expect(ExecuteRooms.ExecuteAll).lastReturnedWith(true);
    expect(GarbageCollection.Check).lastReturnedWith(true);
  });
});
