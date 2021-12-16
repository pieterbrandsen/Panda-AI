import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../memory/initialization";
import RoomPositionHelper from "../../rooms/helpers/roomPosition";
import {
  DefaultCreepMemory,
  DefaultRoomMemory,
} from "../../utils/constants/memory";
import BaseManagerCache from "./baseManager";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", { rooms: {} }, true);
  MemoryInitializer.SetupRootMemory();
});
const managerName: ManagerNames = "mineral";
const mineral = mockInstanceOf<Mineral>({
  id: "mineral",
  room: { name: "room" },
  mineralType: RESOURCE_LEMERGIUM,
  pos: mockInstanceOf<RoomPosition>({
    x: 0,
    y: 0,
    roomName: "room",
    findInRange: jest.fn().mockReturnValue([]),
  }),
  mineralAmount: 100,
});
const room = mockInstanceOf<Room>({
  name: "room",
  find: jest.fn().mockReturnValue([mineral]),
});
const extractor = mockInstanceOf<StructureExtractor>({
  id: "extractor",
  room,
  pos: mockInstanceOf<RoomPosition>({ x: 0, y: 0, roomName: "room" }),
  structureType: STRUCTURE_EXTRACTOR,
});
const container = mockInstanceOf<StructureContainer>({
  id: "container",
  room,
  pos: mockInstanceOf<RoomPosition>({ x: 0, y: 0, roomName: "room" }),
  structureType: STRUCTURE_CONTAINER,
});

const extension = mockInstanceOf<StructureExtension>({
  id: "extension",
  room,
  pos: mockInstanceOf<RoomPosition>({ x: 0, y: 0, roomName: "room" }),
  structureType: STRUCTURE_EXTENSION,
});

describe("BaseManager", () => {
  beforeEach(() => {
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should_ChangeManagerRoom_When_CreepIsInNewRoom", () => {
    // Arrange
    const creep = mockInstanceOf<Creep>({
      name: "creep",
      memory: {},
      room: { name: "room2" },
    });
    Memory.creepsData.data[creep.name] = DefaultCreepMemory(
      {
        name: "mineral",
        roomName: creep.room.name,
      },
      "work"
    );
    Game.getObjectById = jest.fn().mockReturnValue(creep);
    const cache = Memory.roomsData.data[room.name].managersMemory[managerName];
    cache.creeps[creep.name] = { type: "K" };
    Memory.roomsData.data[creep.room.name] = DefaultRoomMemory(creep.room.name);
    const cache2 =
      Memory.roomsData.data[creep.room.name].managersMemory[managerName];

    // Act
    BaseManagerCache(room.name, managerName);

    // Assert
    expect(cache.creeps[creep.name]).toBeUndefined();
    expect(cache2.creeps[creep.name]).toBeDefined();
    expect(Memory.creepsData.data[creep.name].manager.roomName).toBe(
      creep.room.name
    );
  });
  it("Should_NotChangeManagerRoom_When_CreepIsInSameRoom", () => {
    // Arrange
    const creep = mockInstanceOf<Creep>({
      name: "creep",
      memory: {},
      room: { name: "room" },
    });
    Memory.creepsData.data[creep.name] = DefaultCreepMemory(
      {
        name: "mineral",
        roomName: creep.room.name,
      },
      "work"
    );
    Game.getObjectById = jest.fn().mockReturnValue(creep);
    const cache = Memory.roomsData.data[room.name].managersMemory[managerName];
    cache.creeps[creep.name] = { type: "K" };

    // Act
    BaseManagerCache(room.name, managerName);

    // Assert
    expect(cache.creeps[creep.name]).toBeDefined();
    expect(Memory.creepsData.data[creep.name].manager.roomName).toBe(room.name);
  });
  it("Should_DeleteStructuresOutOfCache_When_Null", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory[managerName];
    cache[managerName].id = mineral.id;
    cache[managerName].extractorId = extractor.id;
    cache.structures = {
      [extractor.id]: {
        type: STRUCTURE_EXTRACTOR,
        pos: { x: 0, y: 0, roomName: "room" },
      },
      str: {
        type: STRUCTURE_EXTRACTOR,
        pos: { x: 0, y: 0, roomName: "room" },
      },
    };
    mineral.pos.findInRange = jest.fn().mockReturnValue([extractor]);
    Game.getObjectById = jest.fn().mockReturnValue(null);

    // Act
    BaseManagerCache(room.name, managerName);

    // Assert
    expect(Object.keys(cache.structures)).toHaveLength(2);
    expect(cache[managerName].extractorId).toBeUndefined();
  });
  it("Should_DoNothing_When_NoStructuresAreNull", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory[managerName];
    cache.structures[extractor.id] = {
      pos: { x: 0, y: 0, roomName: "room" },
      type: "extractor",
    };
    Game.getObjectById = jest.fn().mockReturnValue(extractor);

    // Act
    BaseManagerCache(room.name, managerName);

    // Assert
    expect(cache.structures[extractor.id]).toBeDefined();
  });
  it("Should_DeleteConstructionSiteOutOfCache_When_NotFound", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory[managerName];
    cache.constructionSites = {
      [extractor.id]: {
        progressLeft: 0,
        type: STRUCTURE_EXTRACTOR,
        pos: { x: 0, y: 0, roomName: "room" },
      },
    };
    Game.getObjectById = jest.fn().mockReturnValue(null);
    RoomPositionHelper.UnfreezeRoomPosition = jest.fn().mockReturnValue(
      mockInstanceOf<RoomPosition>({
        x: 0,
        y: 0,
        roomName: room.name,
        findInRange: jest.fn().mockReturnValue([]),
      })
    );

    // Act
    BaseManagerCache(room.name, managerName);

    // Assert
    expect(Object.keys(cache.constructionSites)).toHaveLength(0);
  });
  it("Should_DeleteConstructionSiteOutOfCache_When_NotFoundAndInitializeStructureMemory", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory[managerName];
    cache.constructionSites = {
      [extractor.id]: {
        progressLeft: 0,
        type: STRUCTURE_EXTRACTOR,
        pos: { x: 0, y: 0, roomName: "room" },
      },
      [extension.id]: {
        progressLeft: 0,
        type: STRUCTURE_EXTENSION,
        pos: { x: 0, y: 0, roomName: "room" },
      },
    };
    Game.getObjectById = jest.fn().mockReturnValue(null);
    RoomPositionHelper.UnfreezeRoomPosition = jest
      .fn()
      .mockReturnValueOnce(
        mockInstanceOf<RoomPosition>({
          x: 0,
          y: 0,
          roomName: room.name,
          findInRange: jest.fn().mockReturnValue([]),
        })
      )
      .mockReturnValueOnce(
        mockInstanceOf<RoomPosition>({
          x: 0,
          y: 0,
          roomName: room.name,
          findInRange: jest.fn().mockReturnValueOnce([extractor]),
        })
      )
      .mockReturnValueOnce(
        mockInstanceOf<RoomPosition>({
          x: 0,
          y: 0,
          roomName: room.name,
          findInRange: jest.fn().mockReturnValue([]),
        })
      )
      .mockReturnValue(
        mockInstanceOf<RoomPosition>({
          x: 0,
          y: 0,
          roomName: room.name,
          findInRange: jest.fn().mockReturnValue([extension]),
        })
      );

    // Act
    BaseManagerCache(room.name, managerName);

    // Assert
    expect(Object.keys(cache.constructionSites)).toHaveLength(0);
    expect(Object.keys(cache.structures)).toHaveLength(2);
    expect(cache.mineral).toBeDefined();
  });
  it("Should_DeleteSourceConstructionSiteOutOfCache_When_NotFoundAndInitializeStructureMemory", () => {
    // Arrange
    const sourceManagerName = "source";
    const cache =
      Memory.roomsData.data[room.name].managersMemory[sourceManagerName];
    cache.constructionSites = {
      [container.id]: {
        progressLeft: 0,
        type: STRUCTURE_CONTAINER,
        pos: { x: 0, y: 0, roomName: "room" },
      },
      [extension.id]: {
        progressLeft: 0,
        type: STRUCTURE_EXTENSION,
        pos: { x: 0, y: 0, roomName: "room" },
      },
    };
    cache.sources = {
      source: {
        pos: { x: 0, y: 0, roomName: "room" },
        energy: 0,
      },
      source2: {
        pos: { x: 0, y: 0, roomName: "room" },
        energy: 0,
      },
    };
    Game.getObjectById = jest.fn().mockReturnValue(null);
    RoomPositionHelper.UnfreezeRoomPosition = jest
      .fn()
      .mockReturnValueOnce(
        mockInstanceOf<RoomPosition>({
          x: 0,
          y: 0,
          roomName: room.name,
          findInRange: jest.fn().mockReturnValue([]),
          inRangeTo: jest.fn().mockReturnValue(true),
        })
      )
      .mockReturnValueOnce(
        mockInstanceOf<RoomPosition>({
          x: 0,
          y: 0,
          roomName: room.name,
          findInRange: jest.fn().mockReturnValueOnce([container]),
          inRangeTo: jest.fn().mockReturnValue(true),
        })
      )
      .mockReturnValueOnce(
        mockInstanceOf<RoomPosition>({
          x: 0,
          y: 0,
          roomName: room.name,
          findInRange: jest.fn().mockReturnValue([]),
          inRangeTo: jest.fn().mockReturnValue(true),
        })
      )
      .mockReturnValueOnce(
        mockInstanceOf<RoomPosition>({
          x: 0,
          y: 0,
          roomName: room.name,
          findInRange: jest.fn().mockReturnValue([]),
          inRangeTo: jest.fn().mockReturnValue(false),
        })
      )
      .mockReturnValueOnce(
        mockInstanceOf<RoomPosition>({
          x: 0,
          y: 0,
          roomName: room.name,
          findInRange: jest.fn().mockReturnValue([]),
          inRangeTo: jest.fn().mockReturnValue(false),
        })
      )
      .mockReturnValue(
        mockInstanceOf<RoomPosition>({
          x: 0,
          y: 0,
          roomName: room.name,
          findInRange: jest.fn().mockReturnValue([extension]),
          inRangeTo: jest.fn().mockReturnValue(true),
        })
      );

    // Act
    BaseManagerCache(room.name, sourceManagerName);

    // Assert
    expect(Object.keys(cache.constructionSites)).toHaveLength(0);
    expect(Object.keys(cache.structures)).toHaveLength(2);
    expect(cache.sources.source.structure).toBeDefined();
  });
  it("Should_UpdateSite_When_Found", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory[managerName];
    cache.constructionSites = {
      [extractor.id]: {
        progressLeft: 1000,
        type: STRUCTURE_EXTRACTOR,
        pos: { x: 0, y: 0, roomName: "room" },
      },
      site: {
        progressLeft: 10000,
        type: STRUCTURE_EXTRACTOR,
        pos: { x: 0, y: 0, roomName: "room" },
        id: "site" as Id<ConstructionSite>,
      },
    };
    const csSite = mockInstanceOf<ConstructionSite>({
      progress: 0,
      progressTotal: 1,
      id: "site",
    });
    Game.getObjectById = jest.fn().mockReturnValue(csSite);
    RoomPositionHelper.UnfreezeRoomPosition = jest.fn().mockReturnValue(
      mockInstanceOf<RoomPosition>({
        findInRange: jest.fn().mockReturnValue([csSite]),
      })
    );

    // Act
    BaseManagerCache(room.name, managerName);

    // Assert
    expect(Object.keys(cache.constructionSites)).toHaveLength(2);
    expect(cache.constructionSites[extractor.id].progressLeft).toBe(1);
  });
});
