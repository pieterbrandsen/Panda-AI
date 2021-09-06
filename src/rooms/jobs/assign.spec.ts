import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../memory/initialization";
import JobAssignmentsHelper from "./assign";
import JobCreatorHelper from "./creation";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
  MemoryInitializer.SetupRootMemory();
});

describe("AssignJob", () => {
  it("Should_AddJobToCallerMemory_When_Called", () => {
    // Arrange
    const memory = mockInstanceOf<CreepMemory>({});
    const job = JobCreatorHelper.HarvestMineral({
      amount: 0,
      id: "id2",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    });

    // Act
    JobAssignmentsHelper.AssignJob(memory, job);

    // Assert
    expect(memory.job).toBeDefined();
  });
});
