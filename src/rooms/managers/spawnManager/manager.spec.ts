import { mockGlobal, mockInstanceOf } from "screeps-jest";
import CacheManager from "../../../cache/updateCache";
import GarbageCollection from "../../../memory/garbageCollection";
import MemoryInitializer from "../../../memory/initialization";
import { DefaultRoomMemory } from "../../../utils/constants/memory";
import JobUpdater from "../../jobs/update";
import UpdateSpawningQueue from "./update";
import SpawnManager from "./manager";

const roomName = "W1N1";
const room = mockInstanceOf<Room>({
  find: jest.fn().mockReturnValue([]),
  name: roomName,
});
const spawn = mockInstanceOf<StructureSpawn>({
  structureType: STRUCTURE_SPAWN,
  id: "spawn",
  room,
  spawning: null,
});
beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
  spawn.spawnCreep = jest.fn().mockReturnValue(OK);
  MemoryInitializer.SetupRootMemory();
  CacheManager.UpdateMineralManager = jest.fn();
  JobUpdater.Run = jest.fn();
  UpdateSpawningQueue.Update = jest.fn();

  GarbageCollection.CollectRoom = jest.fn();
});
const extension = mockInstanceOf<StructureExtension>({
  structureType: STRUCTURE_EXTENSION,
  id: "extension",
  room,
});

describe("SpawnManager", () => {
  beforeEach(() => {
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
    spawn.spawning = null;
    room.energyAvailable = 300;
    Game.getObjectById = jest.fn().mockReturnValue(spawn);

    const cache = Memory.roomsData.data[room.name].managersMemory.spawn;
    cache.structures[spawn.id] = {
      pos: { x: 1, y: 1, roomName: room.name },
      type: "spawn",
    };
    cache.queue.push(
      mockInstanceOf<QueueCreep>({
        creepType: "work",
        body: [],
        name: "creep",
        roomName: room.name,
        memory: {},
        bodyCost: 0,
        managerName: "spawn",
      })
    );
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should_SpawnPioneer_When_Found", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.spawn;
    const { queue } = cache;
    queue.push(
      mockInstanceOf<QueueCreep>({
        creepType: "pioneer",
        body: [],
        name: "creep",
        roomName: room.name,
        memory: {},
        bodyCost: 0,
        managerName: "spawn",
      })
    );
    cache.structures[extension.id] = {
      pos: { x: 1, y: 1, roomName: room.name },
      type: "extension",
    };
    Game.getObjectById = jest
      .fn()
      .mockReturnValueOnce(spawn)
      .mockReturnValue(extension);

    // Act
    SpawnManager.Run(room);

    // Assert
    expect(spawn.spawnCreep).toHaveBeenCalledWith([], "creep");
    expect(cache.lastSpawnedType).toEqual("pioneer");
    expect(cache.queue.length).toEqual(0);
    expect(Object.keys(cache.creeps)).toHaveLength(1);
  });
  it("Should_SpawnCreepOutOfQueue_When_NoPioneerFound", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.spawn;
    const { queue } = cache;
    queue.push(
      mockInstanceOf<QueueCreep>({
        creepType: "work",
        body: [],
        name: "creep",
        roomName: room.name,
        memory: {},
        bodyCost: 0,
        managerName: "spawn",
      })
    );

    // Act
    SpawnManager.Run(room);

    // Assert
    expect(spawn.spawnCreep).toHaveBeenCalledWith([], "creep");
    expect(cache.lastSpawnedType).toEqual("work");
    expect(cache.queue.length).toEqual(0);
    expect(Object.keys(cache.creeps)).toHaveLength(1);
  });
  it("Should_NotUpdateLastSpawnedType_When_SpawnIsNotOK", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.spawn;
    spawn.spawnCreep = jest.fn().mockReturnValue(ERR_NOT_ENOUGH_ENERGY);

    // Act
    SpawnManager.Run(room);

    // Assert
    expect(cache.queue.length).toEqual(1);
  });
  it("Should_NotCallSpawnCreep_WhenThereIsNotEnoughEnergy", () => {
    // Arrange
    room.energyAvailable = 0;

    // Act
    SpawnManager.Run(room);

    // Assert
    expect(spawn.spawnCreep).not.toHaveBeenCalled();
  });
  it("Should_NotCallSpawnCreep_WhenThereIsNoCreepToSpawn", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.spawn;
    cache.queue = [];

    // Act
    SpawnManager.Run(room);

    // Assert
    expect(spawn.spawnCreep).not.toHaveBeenCalled();
  });
});
