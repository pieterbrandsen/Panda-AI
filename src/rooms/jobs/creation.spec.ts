import { mockGlobal } from "screeps-jest";
import MemoryInitializer from "../../memory/initialization";
import JobCreatorHelper from "./creation";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
  MemoryInitializer.SetupRootMemory();
});

describe("JobCreationHelper", () => {
  it("Should_CreateAnNewJob_When_Called", () => {
    const mineralCache: MineralManagerMineralCache = {
      amount: 0,
      id: "id2",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    };
    const job = JobCreatorHelper.HarvestMineral(mineralCache);

    // Assert
    expect(job.id).toBe(mineralCache.id);
    expect(job.amountLeftToMine).toBe(mineralCache.amount);
    expect(job.type).toBe("harvestMineral");
  });
});
