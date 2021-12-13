import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../memory/initialization";
import JobCreatorHelper from "./creation";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
  MemoryInitializer.SetupRootMemory();
});

describe("JobCreationHelper", () => {
  it("Should_CreateAnNewMineralJob_When_Called", () => {
    const mineralCache: MineralManagerMineralCache = {
      amount: 0,
      id: "mineral",
      pos: { x: 0, y: 0, roomName: "room" },
      type: "H",
    };
    const job = JobCreatorHelper.HarvestMineral(mineralCache);

    // Assert
    expect(job.id).toBe(mineralCache.id);
    expect(job.targetId).toBe(mineralCache.id);
    expect(job.amountLeft).toBe(mineralCache.amount);
    expect(job.type).toBe("harvestMineral");
  });
  it("Should_CreateAnNewSourceJob_When_Called", () => {
    const frozenSource: FreezedSource = {
      energy: 0,
      pos: { x: 0, y: 0, roomName: "room" },
    };
    const job = JobCreatorHelper.HarvestSource(
      frozenSource,
      "id" as Id<Source>
    );

    // Assert
    expect(job.amountLeft).toBe(frozenSource.energy);
    expect(job.type).toBe("harvestSource");
  });
  it("Should_CreateAnNewTransferJob_When_Called", () => {
    const structure = mockInstanceOf<Structure>({
      pos: { x: 0, y: 0, roomName: "room" },
      id: "structure",
      structureType: STRUCTURE_CONTAINER,
      store: { energy: 10, getCapacity: () => 100 },
    });
    const requiredPercentage = 10;
    const resourceType = RESOURCE_ENERGY;
    const job = JobCreatorHelper.Transfer(
      structure,
      requiredPercentage,
      resourceType,
      0
    );

    // Assert
    expect(job.id).toBe(structure.id);
    expect(job.targetId).toBe(structure.id);
    expect(job.amountLeft).toBe(0);
    expect(job.type).toBe("transfer");
  });
  it("Should_CreateAnNewTransferSpawningJob_When_Called", () => {
    const structure = mockInstanceOf<Structure>({
      pos: { x: 0, y: 0, roomName: "room" },
      id: "structure",
      structureType: STRUCTURE_CONTAINER,
      store: { energy: 10, getCapacity: () => 100 },
    });
    const requiredPercentage = 10;
    const resourceType = RESOURCE_ENERGY;
    const job = JobCreatorHelper.TransferSpawning(
      structure,
      requiredPercentage,
      resourceType,
      0
    );

    // Assert
    expect(job.id).toBe(structure.id);
    expect(job.targetId).toBe(structure.id);
    expect(job.amountLeft).toBe(0);
    expect(job.type).toBe("transferSpawning");
  });
  it("Should_CreateAnNewWithdrawJob_When_Called", () => {
    const structure = mockInstanceOf<Structure>({
      pos: { x: 0, y: 0, roomName: "room" },
      id: "structure",
      structureType: STRUCTURE_CONTAINER,
      store: { energy: 10, getCapacity: () => 100 },
    });
    const requiredPercentage = 10;
    const resourceType = RESOURCE_ENERGY;
    const job = JobCreatorHelper.Withdraw(
      structure,
      requiredPercentage,
      resourceType,
      0
    );

    // Assert
    expect(job.id).toBe(structure.id);
    expect(job.targetId).toBe(structure.id);
    expect(job.amountLeft).toBe(0);
    expect(job.type).toBe("withdraw");
  });
  it("Should_CreateAnNewRepairJob_When_Called", () => {
    // Arrange
    const structure = mockInstanceOf<Structure>({
      pos: { x: 0, y: 0, roomName: "room" },
      id: "structure",
      structureType: STRUCTURE_CONTAINER,
      hits: 10,
      hitsMax: 100,
    });

    // Act
    const job = JobCreatorHelper.Repair(structure, structure.hits + 1);

    // Assert
    expect(job.id).toBe(structure.id);
    expect(job.targetId).toBe(structure.id);
    expect(job.amountLeft).toBe(1);
    expect(job.type).toBe("repair");
  });
});
