import { mockGlobal, mockInstanceOf } from "screeps-jest";
import CacheManager from "../../../cache/updateCache";
import MemoryInitializer from "../../../memory/initialization";
import { DefaultRoomMemory } from "../../../utils/constants/memory";
import JobUpdater from "../../jobs/update";
import UpdateSpawningQueue from "../spawnManager/update";
import SourcePositioningHelper from "./getBestSourceStructureSpot";
import SourceManager from "./manager";

const roomName = "W1N1";
const room = mockInstanceOf<Room>({
  find: jest.fn().mockReturnValue([]),
  name: roomName,
  controller: { level: 1 },
  storage: {},
});

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
  MemoryInitializer.SetupRootMemory();
  CacheManager.UpdateSourceManager = jest.fn();
  JobUpdater.Run = jest.fn();
  UpdateSpawningQueue.Update = jest.fn();
});

describe("SourceManager", (): void => {
  beforeEach(() => {
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should_CreateJob_When_NoneInCache", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.source;
    cache.sources = {"source":{energy: 0,pos:{x:0,y:0,roomName:room.name}}};

    // Act
    SourceManager.Run(room);
    SourceManager.Run(room);

    // Assert
    expect(cache.jobs).toHaveLength(1);
  })
  it("Should_SucceedBuildingConstructionSite_WhenNoFreezedStructure", () => {
        // Arrange
        room.controller = mockInstanceOf<StructureController>({level:2});
        const cache = Memory.roomsData.data[room.name].managersMemory.source;
        cache.sources = {"source":{energy: 0,pos:{x:0,y:0,roomName:room.name}}};
        SourcePositioningHelper.GetBestSourceStructureSpot = jest.fn().mockReturnValue({x:0,y:0,roomName: "room"});
        room.createConstructionSite = jest.fn().mockReturnValue(0);

        // Act
        SourceManager.Run(room);
    
        // Assert
        expect(cache.jobs).toHaveLength(1);
    expect(Object.keys(cache.constructionSites)).toHaveLength(1);
    expect(room.createConstructionSite).toHaveBeenCalled();
  })
  it("Should_NotSucceedBuildingConstructionSite_WhenFreezedStructureInSourceMem", () => {
    // Arrange
    room.controller = mockInstanceOf<StructureController>({level:7});
    const cache = Memory.roomsData.data[room.name].managersMemory.source;
    cache.sources = {"source":{energy: 0,pos:{x:0,y:0,roomName:room.name},structure:{id:"id" as Id<Structure>,pos:{x:0,y:0,roomName:room.name},type:"container"}}};
    room.createConstructionSite = jest.fn().mockReturnValue(0);

    // Act
    SourceManager.Run(room);

    // Assert
    expect(room.createConstructionSite).not.toHaveBeenCalled();
})
})