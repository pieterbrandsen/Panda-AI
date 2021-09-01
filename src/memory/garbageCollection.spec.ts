import { mockGlobal, mockInstanceOf } from "screeps-jest";
import GarbageCollection from "./garbageCollection";
import MemoryInitializer from "./initialization";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", { rooms: {}, structures: {}, creeps: {} }, true);
});

describe("HeapInitialization", () => {
  beforeEach(() => {
    Game.time = 0;
    MemoryInitializer.SetupRootMemory();
  });
  it("Should_MoveMemoryObjToGarbageObject_When_Called", () => {
    // Act
    GarbageCollection.Collect({}, "room", "room");
    GarbageCollection.Collect({}, "structure", "structure");
    GarbageCollection.Collect({}, "creep", "creep");

    // Assert
    expect(Memory.garbageData).toHaveLength(3);
    expect(Object.keys(Memory.roomsData.data)).toHaveLength(0);
    expect(Object.keys(Memory.structuresData.data)).toHaveLength(0);
    expect(Object.keys(Memory.creepsData.data)).toHaveLength(0);
  });
  it("Should_BringAliveObjectsBackToMemory_When_Visible", () => {
    // Arrange
    Game.rooms.room = mockInstanceOf<Room>({});
    Game.structures.structure = mockInstanceOf<Structure>({});
    Game.creeps.creep = mockInstanceOf<Creep>({});
    Memory.garbageData = [
      {
        data: {},
        deletedAtTick: -10000,
        liveObjectKey: "room",
        liveObjectType: "room",
      },
      {
        data: {},
        deletedAtTick: -10000,
        liveObjectKey: "structure",
        liveObjectType: "structure",
      },
      {
        data: {},
        deletedAtTick: -10000,
        liveObjectKey: "creep",
        liveObjectType: "creep",
      },
    ];

    // Act
    GarbageCollection.Check();

    // Assert
    expect(Memory.garbageData).toHaveLength(0);
    expect(Object.keys(Memory.roomsData.data)).toHaveLength(1);
    expect(Object.keys(Memory.structuresData.data)).toHaveLength(1);
    expect(Object.keys(Memory.creepsData.data)).toHaveLength(1);
  });
  it("Should_DeleteObject_When_Expired", () => {
    Memory.garbageData = [
      {
        data: {},
        deletedAtTick: -10000,
        liveObjectKey: "deadCreep",
        liveObjectType: "creep",
      },
    ];

    // Act
    GarbageCollection.Check();

    // Assert
    expect(Memory.garbageData).toHaveLength(0);
    expect(Object.keys(Memory.creepsData.data)).toHaveLength(0);
  });

  it("Should_DoNothing_WhenNotVisibleAndNotExpired", () => {
    Memory.garbageData = [
      {
        data: {},
        deletedAtTick: Game.time,
        liveObjectKey: "deadCreep",
        liveObjectType: "creep",
      },
    ];

    // Act
    GarbageCollection.Check();

    // Assert
    expect(Memory.garbageData).toHaveLength(1);
    expect(Object.keys(Memory.creepsData.data)).toHaveLength(0);
  });
});
