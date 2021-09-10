import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../../../memory/initialization";
import { DefaultRoomMemory } from "../../../../utils/constants/memory";
import GetNextCreep from "./getNextCreep";
import QueueCreep from "./queueCreep";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
  MemoryInitializer.SetupRootMemory();
});

describe("GetNextCreep", () => {
  beforeEach(() => {
    Memory.roomsData.data.room = DefaultRoomMemory("room");
  });
  it("Should_SwitchFromWorkToCarrySpawning_When_Called", () => {
    // Arrange
    const cache = Memory.roomsData.data.room.managersMemory.spawn;
    const creep = mockInstanceOf<QueueCreep>({ creepType: "work" });
    const creep2 = mockInstanceOf<QueueCreep>({ creepType: "carry" });
    cache.queue = [creep, creep2];
    cache.lastSpawnedType = "work";

    // Act
    const foundCreep = GetNextCreep("room");

    // Assert
    expect(foundCreep).toBe(creep2);
    expect(cache.lastSpawnedType).toBe("carry");
  });
  it("Should_SwitchFromCarryToWorkSpawning_When_Called", () => {
    // Arrange
    const cache = Memory.roomsData.data.room.managersMemory.spawn;
    const creep = mockInstanceOf<QueueCreep>({ creepType: "carry" });
    const creep2 = mockInstanceOf<QueueCreep>({ creepType: "work" });
    cache.queue = [creep, creep2];
    cache.lastSpawnedType = "carry";

    // Act
    const foundCreep = GetNextCreep("room");

    // Assert
    expect(foundCreep).toBe(creep2);
    expect(cache.lastSpawnedType).toBe("work");
  });
  it("Should_SwitchFromDefaultToWOrkSpawning_When_Called", () => {
    // Arrange
    const cache = Memory.roomsData.data.room.managersMemory.spawn;
    const creep = mockInstanceOf<QueueCreep>({ creepType: "pioneer" });
    const creep2 = mockInstanceOf<QueueCreep>({ creepType: "work" });
    cache.queue = [creep, creep2];
    cache.lastSpawnedType = "pioneer";

    // Act
    const foundCreep = GetNextCreep("room");

    // Assert
    expect(foundCreep).toBe(creep2);
    expect(cache.lastSpawnedType).toBe("work");
  });
});
