import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../memory/initialization";
import { DefaultRoomMemory } from "../../utils/constants/memory";
import UpdateMineralManagerCache from "./mineralManager";
import UpdateSourceManagerCache from "./sourceManager";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", { rooms: {} }, true);
  MemoryInitializer.SetupRootMemory();
});
const source = mockInstanceOf<Source>({
  id: "source",
  room: { name: "room" },
  pos: mockInstanceOf<RoomPosition>({
    x: 0,
    y: 0,
    roomName: "room",
    findInRange: jest.fn().mockReturnValue([]),
  }),
  energy: 100,
});
const room = mockInstanceOf<Room>({
  name: "room",
  find: jest.fn().mockReturnValue([source]),
});

describe("SourceCacheManager", () => {
  beforeEach(() => {
    Game.getObjectById = jest.fn().mockReturnValue(source);
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
 it("Should_AddSourcesToCache_When_SourceCacheIsZero", () => {
  // Arrange
  const cache = Memory.roomsData.data[room.name].managersMemory.source;

  // Act
  UpdateSourceManagerCache(room);

  // Assert
  expect(Object.keys(cache.sources)).toHaveLength(1);
  })
  it("Should_UpdateSource_WhenFound", () => {
      // Arrange
  const cache = Memory.roomsData.data[room.name].managersMemory.source;
  cache.sources[source.id] = {energy:0,pos:source.pos};
  cache.sources["source2"] = {energy:0,pos:source.pos};
  Game.getObjectById = jest.fn().mockReturnValueOnce(source).mockReturnValue(null);

  // Act
  UpdateSourceManagerCache(room);

  // Assert
  expect(cache.sources[source.id].energy).toBeGreaterThan(0);
  })
});
