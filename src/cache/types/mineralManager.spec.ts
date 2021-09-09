import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../memory/initialization";
import RoomPositionHelper from "../../rooms/helpers/roomPosition";
import {
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
  find: jest.fn().mockReturnValue([mineral]),
});

describe("MineralManager", () => {
  beforeEach(() => {
    Game.getObjectById = jest.fn().mockReturnValue(mineral)
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
  });
  afterEach(() => {
    jest.clearAllMocks();
  })
  it("Should_UpdateNothing_When_MineralIsNotFound", () => {
    // Arrange
    const oldFindFunction = room.find;
    const oldGetObjectById = Game.getObjectById;
    Game.getObjectById = jest.fn().mockReturnValue(null);
    room.find = jest.fn().mockReturnValue([]);

    // Act
    UpdateMineralManagerCache(room);

    // Assert
    expect(
      Memory.roomsData.data[room.name].managersMemory.mineral.mineral.id
    ).not.toBe(mineral.id);
    room.find = oldFindFunction;
    Game.getObjectById = oldGetObjectById;
  });
  it("Should_InitializeMineral_When_MineralIsFound", () => {
    // Act
    UpdateMineralManagerCache(room);

    // Assert
    expect(
      Memory.roomsData.data[room.name].managersMemory.mineral.mineral.id
    ).toBe(mineral.id);
  });
  it("Should_UpdateMineral_When_MineralIsFoundAndInitializedAlready", () => {
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
});
