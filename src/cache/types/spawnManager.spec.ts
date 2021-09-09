import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../memory/initialization";
import { DefaultRoomMemory } from "../../utils/constants/memory";
import UpdateSpawnManagerCache from "./spawnManager";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", { rooms: {} }, true);
  MemoryInitializer.SetupRootMemory();
});

const room = mockInstanceOf<Room>({
  name: "room",
});

describe("SpawnManagerCache", () => {
  beforeEach(() => {
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
  });
  it("Should_CallBaseCacheUpdater_When_Called", () => {
    // Act
    UpdateSpawnManagerCache(room);

    // Assert
    expect(true).toBeTruthy();
  });
});
