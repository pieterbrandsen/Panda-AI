import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../memory/initialization";
import { DefaultRoomMemory } from "../../utils/constants/memory";
import CreateConstructionSite from "./createConstructionSite";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", { rooms: {}, structures: {}, creeps: {} }, true);
  MemoryInitializer.SetupRootMemory();
});
const room = mockInstanceOf<Room>({
  name: "W0N1",
  find: jest.fn().mockReturnValue([]),
});

describe("CreateConstructionSite", () => {
  beforeEach(() => {
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
  });
  it("Should_AddSiteToCsSiteCache_WhenOK", () => {
    // Arrange
    room.createConstructionSite = jest.fn().mockReturnValue(OK);
    const managerName: ManagerNames = "mineral";
    const cache = Memory.roomsData.data[room.name].managersMemory[managerName];

    // Act
    CreateConstructionSite(
      room,
      new RoomPosition(1, 1, room.name),
      STRUCTURE_CONTAINER,
      cache
    );

    // Assert
    expect(Object.keys(cache.constructionSites).length).toBe(1);
    expect(room.createConstructionSite).toHaveLastReturnedWith(OK);
  });
});
