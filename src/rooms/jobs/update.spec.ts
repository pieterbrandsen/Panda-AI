import { mockGlobal } from "screeps-jest";
import MemoryInitializer from "../../memory/initialization";
import { DefaultRoomMemory } from "../../utils/constants/memory";
import JobCreatorHelper from "./creation";
import JobUpdater from "./update";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
  MemoryInitializer.SetupRootMemory();
});
const roomName = "room";

describe("JobUpdater", () => {
  beforeEach(() => {
    Game.time = 0;
    Memory.roomsData.data[roomName] = DefaultRoomMemory(roomName);
  });
  it("Should_UpdateJobAndDelete_When_MineralIsEmpty", () => {
    // Arrange
    const cache = Memory.roomsData.data[roomName].managersMemory.mineral;
    const job = JobCreatorHelper.HarvestMineral({
      amount: 0,
      id: "id2",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    });
    const job2 = JobCreatorHelper.HarvestMineral({
      amount: 1,
      id: "id2",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    });
    Game.time = 10000;
    cache.jobs = [job, job2];

    // Act
    JobUpdater.Run(cache.jobs);

    // Assert
    expect(cache.jobs.length).toBe(1);
    expect(cache.jobs[0].amountLeftToMine).toBe(1);
  });
  it("Should_DoNothing_When_NotReadyForUpdating", () => {
    // Arrange
    const cache = Memory.roomsData.data[roomName].managersMemory.mineral;
    const job = JobCreatorHelper.HarvestMineral({
      amount: 0,
      id: "id2",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    });
    const job2 = JobCreatorHelper.HarvestMineral({
      amount: 1,
      id: "id2",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    });
    Game.time = -1;
    cache.jobs = [job, job2];

    // Act
    JobUpdater.Run(cache.jobs);

    // Assert
    expect(cache.jobs.length).toBe(2);
  });
  it("Should_DeleteCorrectJobsOutOfList_When_DeletingJobs", () => {
    // Arrange
    const cache = Memory.roomsData.data[roomName].managersMemory.mineral;
    const deleteJob = JobCreatorHelper.HarvestMineral({
      amount: 0,
      id: "id",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    });
    const job = JobCreatorHelper.HarvestMineral({
      amount: 1,
      id: "id2",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    });
    const deleteJob2 = JobCreatorHelper.HarvestMineral({
      amount: 0,
      id: "id3",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    });
    Game.time = 100000;
    cache.jobs = [deleteJob, job, deleteJob2];

    // Act
    JobUpdater.Run(cache.jobs);

    // Assert
    expect(cache.jobs.length).toBe(1);
    expect(cache.jobs[0].id).toBe("id2");
  });
});
