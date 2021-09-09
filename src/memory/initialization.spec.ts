import { mockGlobal, mockInstanceOf } from "screeps-jest";
import {
  DefaultRoomMemory,
  VersionedMemoryObjects,
  VersionedMemoryTypeName,
} from "../utils/constants/memory";
import MemoryInitializer from "./initialization";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
});
const room = mockInstanceOf<Room>({
  name: "W0N1",
  find: jest.fn().mockReturnValue([]),
});

describe("MemoryInitialization", () => {
  beforeEach(() => {
    MemoryInitializer.SetupRootMemory();
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
  });
  it("Should_SetupMemoryObjects_When_Called", () => {
    // Act
    const managerObject: ManagerObject = { name: "mineral", roomName: "" };
    MemoryInitializer.SetupStructureMemory(
      "str" as Id<Structure>,
      managerObject
    );
    MemoryInitializer.SetupCreepMemory("creep", managerObject, "work");

    // Assert
    expect(Memory.version).toBe(
      VersionedMemoryObjects[VersionedMemoryTypeName.Root]
    );
    expect(Object.keys(Memory.roomsData.data)).toHaveLength(1);
    expect(Object.keys(Memory.structuresData.data)).toHaveLength(1);
    expect(Object.keys(Memory.creepsData.data)).toHaveLength(1);
  });
  it("Should_SetupMemoryFromGarbageCollection_When_Found", () => {
    // Arrange
    const manager: ManagerObject = { name: "mineral", roomName: "" };
    const structure = mockInstanceOf<Structure>({ id: "structure" });
    const creep = mockInstanceOf<Creep>({ name: "creep" });
    Memory.garbageData[structure.id] = {
      data: {},
      deletedAtTick: 0,
      liveObjectType: "structure",
    };
    Memory.garbageData[creep.name] = {
      data: {},
      deletedAtTick: 0,
      liveObjectType: "creep",
    };

    // Act
    MemoryInitializer.SetupStructureMemory(structure.id, manager);
    MemoryInitializer.SetupCreepMemory(creep.name, manager, "work");

    // Assert
    expect(Object.keys(Memory.garbageData)).toHaveLength(0);
  });
});
