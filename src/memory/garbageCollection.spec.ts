import { mockGlobal, mockInstanceOf } from "screeps-jest";
import GarbageCollection from "./garbageCollection";
import MemoryInitializer from "./initialization";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", { rooms: {}, structures: {}, creeps: {} }, true);
});
const room = mockInstanceOf<Room>({
  name: "W0N1",
  find: jest.fn().mockReturnValue([]),
});

describe("GarbageCollection", () => {
  beforeEach(() => {
    Game.time = 0;
    MemoryInitializer.SetupRootMemory();
  });
  it("Should_MoveMemoryObjToGarbageObject_When_Called", () => {
    // Act
    MemoryInitializer.SetupRoomMemory(room);
    GarbageCollection.Collect(
      {
        lastExecutedAtTick: 0,
        manager: { name: "mineral", roomName: room.name },
      },
      "structure",
      "structure"
    );
    GarbageCollection.Collect(
      {
        lastExecutedAtTick: 0,
        manager: { name: "mineral", roomName: "deadRoomSomehow" },
      },
      "creep",
      "creep"
    );
    GarbageCollection.Collect(
      {
        lastExecutedAtTick: 0,
        manager: { name: "mineral", roomName: room.name },
      },
      "creep2",
      "creep"
    );
    GarbageCollection.CollectRoom(Memory.roomsData.data[room.name], room.name);

    // Assert
    expect(Object.keys(Memory.garbageData)).toHaveLength(4);
    expect(Object.keys(Memory.roomsData.data)).toHaveLength(0);
    expect(Object.keys(Memory.structuresData.data)).toHaveLength(0);
    expect(Object.keys(Memory.creepsData.data)).toHaveLength(0);
  });
  it("Should_BringAliveObjectsBackToMemory_When_Visible", () => {
    // Arrange
    MemoryInitializer.SetupRoomMemory(room);
    Game.rooms[room.name] = mockInstanceOf<Room>({});
    Game.structures.structure = mockInstanceOf<Structure>({});
    Game.creeps.creep = mockInstanceOf<Creep>({});
    Memory.garbageData = {
      [room.name]: {
        data: {},
        deletedAtTick: -10000,
        liveObjectType: "room",
      },
      structure: {
        data: {},
        deletedAtTick: -10000,
        liveObjectType: "structure",
      },
      creep: {
        data: {},
        deletedAtTick: -10000,
        liveObjectType: "creep",
      },
    };

    // Act
    GarbageCollection.Check();

    // Assert
    expect(Object.keys(Memory.garbageData)).toHaveLength(0);
    expect(Object.keys(Memory.roomsData.data)).toHaveLength(1);
    expect(Object.keys(Memory.structuresData.data)).toHaveLength(1);
    expect(Object.keys(Memory.creepsData.data)).toHaveLength(1);
  });
  it("Should_DeleteObject_When_Expired", () => {
    Memory.garbageData = {
      deadCreep: {
        data: {},
        deletedAtTick: -10000,
        liveObjectType: "creep",
      },
    };

    // Act
    GarbageCollection.Check();

    // Assert
    expect(Object.keys(Memory.garbageData)).toHaveLength(0);
  });

  it("Should_DoNothing_WhenNotVisibleAndNotExpired", () => {
    Memory.garbageData = {
      deadCreep: {
        data: {},
        deletedAtTick: Game.time,
        liveObjectType: "creep",
      },
    };

    // Act
    GarbageCollection.Check();

    // Assert
    expect(Object.keys(Memory.garbageData)).toHaveLength(1);
  });
});
