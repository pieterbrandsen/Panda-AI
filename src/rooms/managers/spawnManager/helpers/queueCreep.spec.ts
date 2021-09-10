import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../../../memory/initialization";
import { DefaultRoomMemory } from "../../../../utils/constants/memory";
import QueueCreep from "./queueCreep";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
  MemoryInitializer.SetupRootMemory();
});

describe("QueueCreep", () => {
  beforeEach(() => {
    Memory.roomsData.data.room = DefaultRoomMemory("room");
  });
  it("ShouldAddCreepToQueue", () => {
    // Arrange
    const queueCreep = mockInstanceOf<QueueCreep>({});

    // Act
    QueueCreep("room", queueCreep);

    // Assert
    expect(Memory.roomsData.data.room.managersMemory.spawn.queue).toHaveLength(
      1
    );
  });
});
