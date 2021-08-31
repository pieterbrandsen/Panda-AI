import { mockGlobal } from "screeps-jest";
import VersionedMemoryObjects, {
  VersionedMemoryTypeName,
} from "../utils/constants/memory";
import DataMemoryInitializer from "./dataInitialization";
import MemoryInitializer from "./initialization";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
});

describe("DataMemoryInitialization", () => {
  it("Should_SetupMemoryObjects_When_Called", () => {
    // Act
    MemoryInitializer.SetupRootMemory();
    DataMemoryInitializer.SetupRoomDataMemory();
    DataMemoryInitializer.SetupStructureDataMemory();
    DataMemoryInitializer.SetupCreepDataMemory();

    // Assert
    expect(Memory.version).toBe(
      VersionedMemoryObjects[VersionedMemoryTypeName.Root]
    );
    expect(Memory.roomsData.data).toBeInstanceOf(Object);
    expect(Memory.roomsData.version).toBe(
      VersionedMemoryObjects[VersionedMemoryTypeName.Room]
    );

    expect(Memory.structuresData.data).toBeInstanceOf(Object);
    expect(Memory.structuresData.version).toBe(
      VersionedMemoryObjects[VersionedMemoryTypeName.Structure]
    );

    expect(Memory.creepsData.data).toBeInstanceOf(Object);
    expect(Memory.creepsData.version).toBe(
      VersionedMemoryObjects[VersionedMemoryTypeName.Creep]
    );
  });
});