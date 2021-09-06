import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../memory/initialization";
import RoomPositionHelper from "../../rooms/helpers/roomPosition";
import {
  DefaultCreepMemory,
  DefaultRoomMemory,
} from "../../utils/constants/memory";
import UpdateMineralManagerCache from "./mineralManager";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", { rooms: {} }, true);
  MemoryInitializer.SetupRootMemory();
});
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
});
const extractor = mockInstanceOf<StructureExtractor>({
  id: "extractor",
  room,
  pos: mockInstanceOf<RoomPosition>({ x: 0, y: 0, roomName: "room" }),
  structureType: STRUCTURE_EXTRACTOR,
  cooldown: 0,
});

describe("MineralManager", () => {
  beforeEach(() => {
    room.find = jest.fn().mockReturnValue([mineral]);
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
  });
  it("Should_UpdateNothing_When_MineralIsNotFound", () => {
    // Arrange
    room.find = jest.fn().mockReturnValue([]);

    // Act
    UpdateMineralManagerCache(room);

    // Assert
    expect(
      Memory.roomsData.data[room.name].managersMemory.mineral.mineral.id
    ).not.toBe(mineral.id);
  });
  it("Should_InitializeMineral_When_MineralIsFound", () => {
    // Act
    UpdateMineralManagerCache(room);

    // Assert
    expect(
      Memory.roomsData.data[room.name].managersMemory.mineral.mineral.id
    ).toBe(mineral.id);
  });

  it("Should_InitializeMineral_When_MineralIsFound", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
    cache.mineral.id = mineral.id;
    cache.mineral.amount = mineral.mineralAmount + 100000;

    // Act
    UpdateMineralManagerCache(room);

    // Assert
    expect(
      Memory.roomsData.data[room.name].managersMemory.mineral.mineral.amount
    ).toBe(mineral.mineralAmount);
  });
  it("Should_CreateAnExtractorStructureInCache_When_Found", () => {
    // Arrange
    Game.getObjectById = jest.fn().mockReturnValue(extractor);
    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
    mineral.pos.findInRange = jest.fn().mockReturnValue([extractor]);

    // Act
    UpdateMineralManagerCache(room);

    // Assert
    expect(cache.structures[extractor.id]).toBeDefined();
  });
  it("Should_ChangeManagerRoom_When_CreepIsInNewRoom", () => {
    // Arrange
    const creep = mockInstanceOf<Creep>({
      name: "creep",
      memory: {},
      room: { name: "room2" },
    });
    Memory.creepsData.data[creep.name] = DefaultCreepMemory({
      name: "mineral",
      roomName: creep.room.name,
    });
    Game.getObjectById = jest.fn().mockReturnValue(creep);
    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
    cache.creeps[creep.name] = { type: "K" };
    Memory.roomsData.data[creep.room.name] = DefaultRoomMemory(creep.room.name);
    const cache2 =
      Memory.roomsData.data[creep.room.name].managersMemory.mineral;

    // Act
    UpdateMineralManagerCache(room);

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
    Memory.creepsData.data[creep.name] = DefaultCreepMemory({
      name: "mineral",
      roomName: creep.room.name,
    });
    Game.getObjectById = jest.fn().mockReturnValue(creep);
    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
    cache.creeps[creep.name] = { type: "K" };

    // Act
    UpdateMineralManagerCache(room);

    // Assert
    expect(cache.creeps[creep.name]).toBeDefined();
    expect(Memory.creepsData.data[creep.name].manager.roomName).toBe(room.name);
  });
  it("Should_DeleteStructuresOutOfCache_When_Null", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
    cache.mineral.id = mineral.id;
    cache.mineral.extractorId = extractor.id;
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
    UpdateMineralManagerCache(room);

    // Assert
    expect(Object.keys(cache.structures)).toHaveLength(0);
    expect(cache.mineral.extractorId).toBeUndefined();
  });
  it("Should_DoNothing_When_NoStructuresAreNull", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
    cache.structures[extractor.id] = {
      pos: { x: 0, y: 0, roomName: "room" },
      type: "extractor",
    };
    Game.getObjectById = jest.fn().mockReturnValue(extractor);

    // Act
    UpdateMineralManagerCache(room);

    // Assert
    expect(cache.structures[extractor.id]).toBeDefined();
  });

  it("Should_DeleteConstructionSiteOutOfCache_When_NotFound", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
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
    UpdateMineralManagerCache(room);

    // Assert
    expect(Object.keys(cache.constructionSites)).toHaveLength(0);
  });
  it("Should_DeleteConstructionSiteOutOfCache_When_NotFound", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
    cache.constructionSites = {
      [extractor.id]: {
        progressLeft: 0,
        type: STRUCTURE_EXTRACTOR,
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
      .mockReturnValue(
        mockInstanceOf<RoomPosition>({
          x: 0,
          y: 0,
          roomName: room.name,
          findInRange: jest.fn().mockReturnValue([extractor]),
        })
      );

    // Act
    UpdateMineralManagerCache(room);

    // Assert
    expect(Object.keys(cache.constructionSites)).toHaveLength(0);
    expect(Object.keys(cache.structures)).toHaveLength(1);
  });
  it("Should_UpdateSite_When_Found", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
    cache.constructionSites = {
      [extractor.id]: {
        progressLeft: 1000,
        type: STRUCTURE_EXTRACTOR,
        pos: { x: 0, y: 0, roomName: "room" },
      },
      "site": {
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
    UpdateMineralManagerCache(room);

    // Assert
    expect(Object.keys(cache.constructionSites)).toHaveLength(2);
    expect(cache.constructionSites[extractor.id].progressLeft).toBe(1);
  });
});
