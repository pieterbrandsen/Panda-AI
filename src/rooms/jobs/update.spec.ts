import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../memory/initialization";
import JobUpdater from "./update";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
  MemoryInitializer.SetupRootMemory();
});

describe("JobUpdater", () => {
  beforeEach(() => {
    Game.time = 0;
  });
  it("Should_DoNothing_When_NotReadyForUpdating", () => {
    // Arrange
    const job = mockInstanceOf<Job>({
      type: "transfer",
      targetId: "",
      id: "job",
      nextUpdateTick: 0,
    });

    Game.time = -1;
    const jobs = [job];

    // Act
    JobUpdater.Run(jobs);

    // Assert
    expect(jobs.length).toBe(1);
  });
  it("Should_NotUpdateWithdrawJob_When_StructureIsNull", () => {
    // Arrange
    Game.getObjectById = jest.fn().mockReturnValue(null);
    const job = mockInstanceOf<Job>({
      type: "transfer",
      targetId: "",
      nextUpdateTick: 0,
      amountLeft: 10,
    });
    const jobs = [job];

    // Act
    JobUpdater.Run(jobs);

    // Assert
    expect(jobs[0].amountLeft).toBe(10);
  });
  it("Should_UpdateAmountLeftToCorrectValueForBothTypes", () => {
    // Arrange
    const structure = mockInstanceOf<Structure>({
      id: "id1",
      store: { energy: 9, getCapacity: jest.fn().mockReturnValue(100) },
    });
    Game.getObjectById = jest.fn().mockReturnValue(structure);
    const transferJob = mockInstanceOf<Job>({
      type: "transfer",
      targetId: "",
      id: "job",
      nextUpdateTick: 0,
      resourceType: "energy",
      requiredPercentage: 10,
      amountLeft: 10,
    });
    const withdrawJob = mockInstanceOf<Job>({
      type: "withdraw",
      targetId: "",
      id: "job",
      nextUpdateTick: 0,
      resourceType: "energy",
      requiredPercentage: 10,
      amountLeft: 10,
    });
    const jobs = [transferJob, withdrawJob];

    // Act
    JobUpdater.Run(jobs);

    // Assert
    expect(transferJob.amountLeft).toBe(1);
    expect(withdrawJob.amountLeft).toBe(0);
  });
});
