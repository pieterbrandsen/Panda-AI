import { mockGlobal, mockInstanceOf } from "screeps-jest";
import SetupStructuresCache from "./setupStructuresCache";
import MemoryInitializer from "../../memory/initialization";
import { DefaultRoomMemory } from "../../utils/constants/memory";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
});

const getStructure = (structureType: StructureConstant): Structure => {
  return mockInstanceOf<Structure>({
    pos: { x: 0, y: 0, roomName: "room" },
    structureType,
    id: structureType as Id<Structure>,
  });
};

const room = mockInstanceOf<Room>({
  name: "W0N1",
});

describe("SetupStructureCache", () => {
  beforeEach(() => {
    MemoryInitializer.SetupRootMemory();
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
  });
  it("Should_OnlyAddExtractorsToCache_When_ManagerIsMineral", () => {
    // Arrange
    room.find = jest
      .fn()
      .mockReturnValue([
        getStructure(STRUCTURE_EXTRACTOR),
        getStructure(STRUCTURE_EXTENSION),
      ]);

    // Act
    SetupStructuresCache(room);

    // Assert
    expect(
      Object.keys(
        Memory.roomsData.data[room.name].managersMemory.mineral.structures
      )
    ).toEqual(["extractor"]);
    expect(Object.keys(Memory.structuresData.data)).toHaveLength(2);
  });
  it("Should_OnlyAddExtensionsAndSpawnsToCache_When_ManagerIsSpawn", () => {
    // Arrange
    room.find = jest
      .fn()
      .mockReturnValue([
        getStructure(STRUCTURE_EXTRACTOR),
        getStructure(STRUCTURE_EXTENSION),
        getStructure(STRUCTURE_SPAWN),
      ]);

    // Act
    SetupStructuresCache(room);

    // Assert
    expect(
      Object.keys(
        Memory.roomsData.data[room.name].managersMemory.spawn.structures
      )
    ).toHaveLength(2);
    expect(Object.keys(Memory.structuresData.data)).toHaveLength(3);
  });
});
