import ResourceLevels from "../../../utils/constants/resourceLevels";
import JobCreatorHelper from "../../jobs/creation";

export default class ResourceStorageManager {
  /**
   * Create jobs required to manage the structure resource level
   * @param structure - Structure to manage
   * @param jobs - List of jobs to add too
   * @param isSourceStructure
   * @param isControllerStructure
   * @param isHearthStructure
   */
  public static ControlStructureResourceLevel(
    structure:
      | StructureStorage
      | StructureTerminal
      | StructureContainer
      | StructureLink
      | StructureTower
      | StructureSpawn
      | StructureExtension,
    jobs: Job[],
    isSourceStructure = false,
    isControllerStructure = false,
    isHearthStructure = false
  ): void {
    const resourceType: ResourceConstant = RESOURCE_ENERGY;
    let resourceLevel: ResourceLevel | undefined;
    switch (structure.structureType) {
      case "container":
        if (isSourceStructure) resourceLevel = ResourceLevels.containerSource;
        else if (isControllerStructure)
          resourceLevel = ResourceLevels.containerController;
        break;
      case "link":
        if (isSourceStructure) resourceLevel = ResourceLevels.linkSource;
        else if (isControllerStructure)
          resourceLevel = ResourceLevels.linkController;
        else if (isHearthStructure) resourceLevel = ResourceLevels.linkHearth;
        break;
      case "extension":
        resourceLevel = ResourceLevels.extension;
        break;
      case "storage":
        resourceLevel = ResourceLevels.storage;
        break;
      case "terminal":
        resourceLevel = ResourceLevels.terminal;
        break;
      case "spawn":
        resourceLevel = ResourceLevels.spawn;
        break;
      case "tower":
        resourceLevel = ResourceLevels.tower;
        break;

      // skip default case
    }

    if (!resourceLevel) return;

    const usedStorage = structure.store[resourceType];
    const maxStorage = structure.store.getCapacity(resourceType) as number;
    const storageLevel = Math.floor((usedStorage / maxStorage) * 100);
    const amountLeftToMax = maxStorage - usedStorage;
    const amountLeftToEmpty = usedStorage;

    if (
      ([
        STRUCTURE_STORAGE,
        STRUCTURE_TERMINAL,
        STRUCTURE_LINK,
      ] as StructureConstant[]).includes(structure.structureType)
    ) {
      if (storageLevel < resourceLevel.empty || storageLevel === 0) {
        const job = jobs.find(
          (j) => j.targetId === structure.id && j.type === "transfer"
        );
        if (!job)
          jobs.push(
            JobCreatorHelper.Transfer(
              structure,
              resourceLevel.empty,
              resourceType,
              amountLeftToMax,
              true
            )
          );
      } else if (
        storageLevel > resourceLevel.empty &&
        storageLevel < resourceLevel.full
      ) {
        let job = jobs.find(
          (j) => j.targetId === structure.id && j.type === "transfer"
        );
        if (!job)
          jobs.push(
            JobCreatorHelper.Transfer(
              structure,
              resourceLevel.full,
              resourceType,
              amountLeftToMax,
              false
            )
          );
        job = jobs.find(
          (j) => j.targetId === structure.id && j.type === "withdraw"
        );
        if (!job)
          jobs.push(
            JobCreatorHelper.Withdraw(
              structure,
              resourceLevel.empty,
              resourceType,
              amountLeftToEmpty,
              false
            )
          );
      } else if (storageLevel > resourceLevel.full) {
        const job = jobs.find(
          (j) => j.targetId === structure.id && j.type === "withdraw"
        );
        if (!job)
          jobs.push(
            JobCreatorHelper.Withdraw(
              structure,
              resourceLevel.full,
              resourceType,
              amountLeftToEmpty,
              true
            )
          );
      }
    } else if (
      storageLevel < resourceLevel.empty ||
      storageLevel + resourceLevel.empty === 0
    ) {
      const job = jobs.find(
        (j) => j.targetId === structure.id && j.type === "transfer"
      );
      if (!job)
        jobs.push(
          JobCreatorHelper.Transfer(
            structure,
            resourceLevel.empty,
            resourceType,
            amountLeftToMax,
            true
          )
        );
    } else if (storageLevel > resourceLevel.full) {
      const job = jobs.find(
        (j) => j.targetId === structure.id && j.type === "withdraw"
      );
      if (!job)
        jobs.push(
          JobCreatorHelper.Withdraw(
            structure,
            resourceLevel.full,
            resourceType,
            amountLeftToEmpty,
            true
          )
        );
    }
  }
}
