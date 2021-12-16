import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { ResourceLevels } from "../../../utils/constants/resources";
import ResourceStorageManager from "./manager";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", { rooms: {}, creeps: {} }, true);
});
const storage = mockInstanceOf<StructureStorage>({
  id: "structure",
  structureType: STRUCTURE_STORAGE,
  store: { energy: 0, getCapacity: () => 100 },
  pos: { x: 0, y: 0, roomName: "roomName" },
});
const container = mockInstanceOf<StructureContainer>({
  id: "structure",
  structureType: STRUCTURE_CONTAINER,
  store: { energy: 0, getCapacity: () => 100 },
  pos: { x: 0, y: 0, roomName: "roomName" },
});

describe("ResourceManager", () => {
  it("Should_CreateAnTransferJobForStorage_WhenEnergyLevelIsTooLow", () => {
    // Arrange
    const jobs: Job[] = [];
    storage.store.energy = 0;

    // Act
    ResourceStorageManager.ControlStructureResourceLevel(storage, jobs);
    ResourceStorageManager.ControlStructureResourceLevel(storage, jobs);

    // Assert
    expect(jobs.length).toBe(1);
    expect(jobs[0].type).toBe("transfer");
    expect(jobs[0].hasNeedOfFulfillment).toBe(true);
  });
  it("Should_CreateAnTransferANDWithdrawJobForStorage_WhenEnergyLevelIsMedium", () => {
    // Arrange
    const jobs: Job[] = [];
    storage.store.energy = ResourceLevels.energy.storage.empty + 1;

    // Act
    ResourceStorageManager.ControlStructureResourceLevel(storage, jobs);
    ResourceStorageManager.ControlStructureResourceLevel(storage, jobs);

    // Assert
    const jobTypes: JobType[] = jobs.map((job) => job.type);
    expect(jobs.length).toBe(2);
    expect(jobTypes.includes("transfer")).toBe(true);
    expect(jobTypes.includes("withdraw")).toBe(true);
    expect(jobs[0].hasNeedOfFulfillment).toBe(false);
    expect(jobs[1].hasNeedOfFulfillment).toBe(false);
  });
  it("Should_CreateAnWithdrawJobForStorage_WhenEnergyLevelIsTooHigh", () => {
    // Arrange
    const jobs: Job[] = [];
    storage.store.energy = ResourceLevels.energy.storage.full + 1;

    // Act
    ResourceStorageManager.ControlStructureResourceLevel(storage, jobs);
    ResourceStorageManager.ControlStructureResourceLevel(storage, jobs);

    // Assert
    expect(jobs.length).toBe(1);
    expect(jobs[0].hasNeedOfFulfillment).toBe(true);
    expect(jobs[0].type).toBe("withdraw");
  });
  it("Should_DoNothingForStorage_WhenEnergyLevelIsAtOneOfTheLevels", () => {
    // Arrange
    const jobs: Job[] = [];
    storage.store.energy = ResourceLevels.energy.storage.full;

    // Act
    ResourceStorageManager.ControlStructureResourceLevel(storage, jobs);

    // Assert
    expect(jobs.length).toBe(0);
  });
  it("Should_CreateAnTransferJobForContainer_WhenEnergyLevelIsTooLow", () => {
    // Arrange
    const jobs: Job[] = [];
    container.store.energy = 0;

    // Act
    ResourceStorageManager.ControlStructureResourceLevel(
      container,
      jobs,
      false,
      true
    );
    ResourceStorageManager.ControlStructureResourceLevel(
      container,
      jobs,
      false,
      true
    );

    // Assert
    expect(jobs.length).toBe(1);
    expect(jobs[0].type).toBe("transfer");
    expect(jobs[0].hasNeedOfFulfillment).toBe(true);
  });
  it("Should_CreateAnWithdrawJobForContainer_WhenEnergyLevelIsTooHigh", () => {
    // Arrange
    const jobs: Job[] = [];
    container.store.energy = ResourceLevels.energy.containerSource.full + 1;

    // Act
    ResourceStorageManager.ControlStructureResourceLevel(container, jobs, true);
    ResourceStorageManager.ControlStructureResourceLevel(container, jobs, true);

    // Assert
    expect(jobs.length).toBe(1);
    expect(jobs[0].hasNeedOfFulfillment).toBe(true);
    expect(jobs[0].type).toBe("withdraw");
  });
  it("Should_DoNothingForContainer_WhenEnergyLevelIsAtOneOfTheLevels", () => {
    // Arrange
    const jobs: Job[] = [];
    container.store.energy = ResourceLevels.energy.containerController.full;

    // Act
    ResourceStorageManager.ControlStructureResourceLevel(
      container,
      jobs,
      false,
      true
    );

    // Assert
    expect(jobs.length).toBe(0);
  });
  it("Should_CheckAllSwitchStatements", () => {
    const structure = mockInstanceOf<StructureContainer>({
      id: "structure",
      structureType: STRUCTURE_CONTAINER,
      store: { energy: 0, getCapacity: () => 100 },
      pos: { x: 0, y: 0, roomName: "roomName" },
    });
    const spyFunction = jest.spyOn(
      ResourceStorageManager,
      "ControlStructureResourceLevel"
    );

    // Arrange
    const structureTypes: StructureConstant[] = [
      "container",
      "link",
      "extension",
      "spawn",
      "spawn",
      "terminal",
      "tower",
      "extension",
    ];

    // Act
    structureTypes.forEach((structureType) => {
      structure.structureType = structureType as STRUCTURE_CONTAINER;
      if (structureType === "container") {
        ResourceStorageManager.ControlStructureResourceLevel(
          structure,
          [],
          true
        );
        ResourceStorageManager.ControlStructureResourceLevel(
          structure,
          [],
          false,
          true
        );
        ResourceStorageManager.ControlStructureResourceLevel(
          structure,
          [],
          false,
          false
        );
      } else if (structureType === "link") {
        ResourceStorageManager.ControlStructureResourceLevel(
          structure,
          [],
          true
        );
        ResourceStorageManager.ControlStructureResourceLevel(
          structure,
          [],
          false,
          true
        );
        ResourceStorageManager.ControlStructureResourceLevel(
          structure,
          [],
          false,
          false,
          true
        );
        ResourceStorageManager.ControlStructureResourceLevel(
          structure,
          [],
          false,
          false,
          false
        );
      } else {
        ResourceStorageManager.ControlStructureResourceLevel(structure, []);
      }
    });

    // Assert
    expect(spyFunction).toHaveBeenCalledTimes(structureTypes.length + 2 + 3);
  });
  it("Should_Return3TypesOfResourceLevels_WhenCalledWithDifferentResources", () => {
    // Act
    const mineral = ResourceStorageManager.GetResourceLevel(RESOURCE_POWER);
    const compound = ResourceStorageManager.GetResourceLevel(
      RESOURCE_CATALYZED_GHODIUM_ACID
    );
    const factory = ResourceStorageManager.GetResourceLevel(RESOURCE_MACHINE);

    // Assert
    expect(mineral.empty).toBe(ResourceLevels.default.mineral.empty);
    expect(compound.empty).toBe(ResourceLevels.default.compounds.empty);
    expect(factory.empty).toBe(ResourceLevels.default.factory.empty);
  });
});
