import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../../memory/initialization";
import { DefaultRoomMemory } from "../../../utils/constants/memory";
import JobCreatorHelper from "../../jobs/creation";
import BodyHelper from "./helpers/body";
import UpdateSpawningQueue from "./update";

const roomName = "W1N1";
const room = mockInstanceOf<Room>({
  find: jest.fn().mockReturnValue([]),
  name: roomName,
  energyCapacityAvailable: 30000,
});
beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
  MemoryInitializer.SetupRootMemory();
});

describe("UpdateQueue", () => {
  beforeEach(() => {
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
  });
  it("Should_DoNothing_WhenNoCreepIsRequiredBecauseNoJobsInCach", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.spawn;
    cache.creeps = { creep: {}, creep2: {}, creep3: {} };
    Memory.creepsData.data = {
      creep: {
        creepType: "pioneer",
        lastExecutedAtTick: 0,
        manager: { name: "spawn", roomName: room.name },
      },
      creep2: {
        creepType: "carry",
        lastExecutedAtTick: 0,
        manager: { name: "spawn", roomName: room.name },
      },
      creep3: {
        creepType: "carry",
        lastExecutedAtTick: 0,
        manager: { name: "spawn", roomName: room.name },
      },
    };
    Game.creeps = {
      creep: mockInstanceOf<Creep>({ body: [{ type: WORK }] }),
      creep2: mockInstanceOf<Creep>({ body: [{ type: WORK }] }),
    };

    // Act
    UpdateSpawningQueue.Update(room, "harvestMineral", "spawn");

    // Assert
    expect(cache.queue).toHaveLength(0);
  });
  it("Should_DoNothing_WhenNoCreepIsRequiredBecauseQueueIsFull", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.spawn;
    cache.queue = [
      mockInstanceOf<QueueCreep>({
        creepType: "pioneer",
        body: [WORK, CARRY, MOVE],
        managerName: "spawn",
      }),
    ];

    // Act
    UpdateSpawningQueue.Update(room, "harvestMineral", "spawn");

    // Assert
    expect(cache.queue).toHaveLength(1);
  });
  it("Should_AddAnCreepToTheQueueForEachCreepType_When_BodyPartsMissing", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.spawn;
    cache.jobs = [
      JobCreatorHelper.HarvestMineral({
        amount: 100000,
        id: "mineral",
        pos: new RoomPosition(0, 0, room.name),
        type: "H",
      }),
    ];

    // Act
    UpdateSpawningQueue.Update(room, "harvestMineral", "spawn");
    UpdateSpawningQueue.Update(room, "harvestSource", "spawn");
    UpdateSpawningQueue.Update(room, "pioneer", "spawn");
    UpdateSpawningQueue.Update(room, "build", "spawn");
    UpdateSpawningQueue.Update(room, "repair", "spawn");
    UpdateSpawningQueue.Update(room, "transfer", "spawn");
    UpdateSpawningQueue.Update(room, "transferSpawning", "spawn");

    // Assert
    expect(cache.queue).toHaveLength(2);
  });
  it("Should_NotAddBody_When_BodyIsEmpty", () => {
    // Arrange
    const cache = Memory.roomsData.data[room.name].managersMemory.spawn;
    const spyBodyFunction = jest
      .spyOn(BodyHelper, "Generate")
      .mockReturnValueOnce([[]]);

    // Act
    UpdateSpawningQueue.Update(room, "pioneer", "spawn");

    // Assert
    expect(cache.queue).toHaveLength(0);
    expect(spyBodyFunction).toHaveLastReturnedWith([[]]);
  });
});
