import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { DefaultRoomMemory } from "../utils/constants/memory";
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
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
  });
  it("Should_MoveMemoryObjToGarbageObject_When_Called", () => {
    // Act
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
      "structure2",
      "structure"
    );
    GarbageCollection.CollectRoom(Memory.roomsData.data[room.name], room.name);

    // Assert
    expect(Object.keys(Memory.garbageData)).toHaveLength(3);
    expect(Object.keys(Memory.roomsData.data)).toHaveLength(0);
    expect(Object.keys(Memory.structuresData.data)).toHaveLength(0);
  });
  it("Should_BringAliveObjectsBackToMemory_When_Visible", () => {
    // Arrange
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
    };

    // Act
    GarbageCollection.Check();

    // Assert
    expect(Object.keys(Memory.garbageData)).toHaveLength(0);
    expect(Object.keys(Memory.roomsData.data)).toHaveLength(1);
    expect(Object.keys(Memory.structuresData.data)).toHaveLength(1);
  });
  it("Should_DeleteObject_When_Expired", () => {
    Memory.garbageData = {
      deadCreep: {
        data: {},
        deletedAtTick: -10000,
        liveObjectType: "structure",
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
        liveObjectType: "room",
      },
    };

    // Act
    GarbageCollection.Check();

    // Assert
    expect(Object.keys(Memory.garbageData)).toHaveLength(1);
  });
});
