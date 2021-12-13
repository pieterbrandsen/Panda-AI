import { mockGlobal, mockInstanceOf } from "screeps-jest";
import CacheManager from "../../../cache/updateCache";
import GarbageCollection from "../../../memory/garbageCollection";
import MemoryInitializer from "../../../memory/initialization";
import { DefaultRoomMemory } from "../../../utils/constants/memory";
import CreateConstructionSite from "../../helpers/createConstructionSite";
import RoomPositionHelper from "../../helpers/roomPosition";
import JobUpdater from "../../jobs/update";
import UpdateSpawningQueue from "../spawnManager/update";
import MineralManager from "./manager";

const roomName = "W1N1";
const room = mockInstanceOf<Room>({
  find: jest.fn().mockReturnValue([]),
  name: roomName,
  controller: { level: 6 },
  storage: {},
});
const extractor = mockInstanceOf<StructureExtractor>({
  id: "extractorId",
  room,
});
beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
  MemoryInitializer.SetupRootMemory();
  CacheManager.UpdateMineralManager = jest.fn();
  JobUpdater.Run = jest.fn();
  UpdateSpawningQueue.Update = jest.fn();

  GarbageCollection.CollectRoom = jest.fn();
  Game.getObjectById = jest.fn().mockReturnValue(extractor);
});
const roomWithLowLevelController = mockInstanceOf<Room>({
  find: jest.fn().mockReturnValue([]),
  name: roomName,
  controller: { level: 5 },
});

jest.mock("../../helpers/createConstructionSite", () => ({
  default: jest.fn(),
}));

describe("MineralManager", () => {
  beforeEach(() => {
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
    Memory.roomsData.data[roomWithLowLevelController.name] = DefaultRoomMemory(
      roomWithLowLevelController.name
    );
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should_DoNothing_When_ControllerLevelIsTooLow", () => {
    // Act
    MineralManager.Run(roomWithLowLevelController);

    // Assert
    expect(CacheManager.UpdateMineralManager).toBeCalledTimes(0);
  });
  it("Should_NotBuildNewExtractor_When_FoundInMemory", () => {
    // Arrange
    const oldFunction = Game.getObjectById;
    Game.getObjectById = jest.fn(() => undefined);
    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
    cache.constructionSites[
      RoomPositionHelper.PositionToStringConverter(cache.mineral.pos)
    ] = {
      pos: cache.mineral.pos,
      type: STRUCTURE_EXTRACTOR,
      progressLeft: 1,
    };

    // Act
    MineralManager.Run(room);

    // Assert
    expect(CreateConstructionSite).toHaveBeenCalledTimes(0);
    Game.getObjectById = oldFunction;
  });
  it("Should_BuildNewExtractor_When_NoFound", () => {
    // Arrange
    const oldFunction = Game.getObjectById;
    Game.getObjectById = jest.fn(() => undefined);

    // Act
    MineralManager.Run(room);

    // Assert
    expect(CreateConstructionSite).toBeCalledTimes(1);
    Game.getObjectById = oldFunction;
  });
  it("Should_AddAnJob_When_NoneWasFoundForMining", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
    cache.mineral.amount = 100;

    // Act
    MineralManager.Run(room);
    MineralManager.Run(room);

    // Assert
    expect(cache.jobs.length).toBe(1);
  });

  it("Should_CallSpawnQueueUpdater_When_Called", () => {
    // Act
    MineralManager.Run(room);

    // Assert
    expect(UpdateSpawningQueue.Update).toBeCalledTimes(3);
  });
});
