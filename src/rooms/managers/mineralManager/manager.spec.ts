import { mockGlobal, mockInstanceOf } from "screeps-jest";
import CacheManager from "../../../cache/updateCache";
import GarbageCollection from "../../../memory/garbageCollection";
import MemoryInitializer from "../../../memory/initialization";
import CreateConstructionSite from "../../helpers/createConstructionSite";
import RoomPositionHelper from "../../helpers/roomPosition";
import MineralManager from "./manager";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
  MemoryInitializer.SetupRootMemory();
});
const roomName = "W1N1";
const room = mockInstanceOf<Room>({
  find: jest.fn().mockReturnValue([]),
  name: roomName,
  controller: { level: 6 },
  storage: {},
});
const roomWithLowLevelController = mockInstanceOf<Room>({
  find: jest.fn().mockReturnValue([]),
  name: roomName,
  controller: { level: 5 },
});
const extractor = mockInstanceOf<StructureExtractor>({
  id: "extractorId",
  room,
});

jest.mock("../../helpers/createConstructionSite", () => ({
  default: jest.fn(),
}));

describe("MineralManager", () => {
  beforeEach(() => {
    CacheManager.UpdateMineralManager = jest.fn();
    MemoryInitializer.SetupRoomMemory(room);
    MemoryInitializer.SetupRoomMemory(roomWithLowLevelController);
    GarbageCollection.CollectRoom = jest.fn();
    Game.getObjectById = jest.fn(() => extractor);
  });
  it("Should_DoNothing_When_ControllerLevelIsTooLow", () => {
    // Act
    MineralManager.Run(roomWithLowLevelController);

    // Assert
    expect(CacheManager.UpdateMineralManager).toBeCalledTimes(0);
  });
  it("Should_NotBuildNewExtractor_When_FoundInMemory", () => {
    // Arrange
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
  });
  it("Should_BuildNewExtractor_When_NoFound", () => {
    // Arrange
    Game.getObjectById = jest.fn(() => undefined);

    // Act
    MineralManager.Run(room);

    // Assert
    expect(CreateConstructionSite).toBeCalledTimes(1);
  });
  it("Should_AddAnJob_When_NoneWasFoundForMining", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
    cache.mineral.amount = 100;

    // Act
    MineralManager.Run(room);

    // Assert
    expect(cache.jobs.length).toBe(1);
  });
});
