import { mockGlobal } from "screeps-jest";
import VersionedMemoryObjects, {
  VersionedMemoryTypeName,
} from "../utils/constants/memory";
import MemoryInitializer from "./initialization";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
});

describe("MemoryInitialization", () => {
  it("Should_SetupMemoryObjects_When_Called", () => {
    // Act
    MemoryInitializer.SetupRootMemory();
    MemoryInitializer.SetupRoomMemory("room");
    MemoryInitializer.SetupStructureMemory("str" as Id<Structure>);
    MemoryInitializer.SetupCreepMemory("creep");

    // Assert
    expect(Memory.version).toBe(
      VersionedMemoryObjects[VersionedMemoryTypeName.Root]
    );
    expect(Object.keys(Memory.roomsData.data)).toHaveLength(1);
    expect(Object.keys(Memory.structuresData.data)).toHaveLength(1);
    expect(Object.keys(Memory.creepsData.data)).toHaveLength(1);
  });
});
