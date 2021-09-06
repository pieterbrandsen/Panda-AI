import { mockGlobal } from "screeps-jest";
import MemoryInitializer from "../../../memory/initialization";
import JobCreatorHelper from "../creation";
import WorkJobsHelper from "./work";
import WorkJobTypes from "../../../utils/constants/jobTypes";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
  MemoryInitializer.SetupRootMemory();
});

describe("FindWorkJobs", () => {
  it("Should_ReturnOnlyWorkJobs_When_CalledWithMultipleTypes", () => {
    // Arrange
    const job = JobCreatorHelper.HarvestMineral({
      amount: 0,
      id: "id",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    });
    const job2 = JobCreatorHelper.HarvestMineral({
      amount: 0,
      id: "id2",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    });
    job2.type = "a" as JobType;

    // Act
    const workJobs = WorkJobsHelper.GetAllJobs([job, job2]);

    // Assert
    expect(workJobs).toHaveLength(1);
    expect(
      workJobs.find((j) => !WorkJobTypes.includes(j.type))
    ).toBeUndefined();
  });
  it("Should_ReturnJobWithOldestAssignmentOfWorker_When_Called", () => {
    // Arrange
    const job = JobCreatorHelper.HarvestMineral({
      amount: 0,
      id: "id",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    });
    const job2 = JobCreatorHelper.HarvestMineral({
      amount: 0,
      id: "id2",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    });
    job2.latestStructureOrCreepAssignedAtTick = -1;
    const job3 = JobCreatorHelper.HarvestMineral({
      amount: 0,
      id: "id2",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    });
    job3.latestStructureOrCreepAssignedAtTick = -2;
    job3.available = false;

    // Act
    const newJob = WorkJobsHelper.FindNewJob([job, job2]);

    // Assert
    expect(newJob).toBeDefined();
    if (!newJob) return;
    expect(newJob.id).toBe(job2.id);
  });
});
