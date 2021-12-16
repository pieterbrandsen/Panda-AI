import { forEach, uniq } from "lodash";
import {
  MineralResources,
  CompoundResources,
  FactoryResources,
  ResourceLevels,
} from "../../../utils/constants/resources";
import JobCreatorHelper from "../../jobs/creation";

export default class ResourceStorageManager {
  public static GetResourceLevel(resource: ResourceConstant): ResourceLevel {
    if (MineralResources.includes(resource)) {
      return ResourceLevels.default.mineral;
    }
    if (CompoundResources.includes(resource)) {
      return ResourceLevels.default.compounds;
    }
    if (FactoryResources.includes(resource)) {
      return ResourceLevels.default.factory;
    }
    return ResourceLevels.default.factory;
  }

  private static ControlResourceLevel(
    structure:
      | StructureStorage
      | StructureTerminal
      | StructureContainer
      | StructureLink
      | StructureTower
      | StructureSpawn
      | StructureExtension,
    jobs: Job[],
    resourceLevel: ResourceLevel,
    resourceType: ResourceConstant
  ) {
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
      ([STRUCTURE_SPAWN,StructureExtension] as StructureConstant[]).includes(structure.structureType) &&
      storageLevel < resourceLevel.full
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
    } else if (storageLevel >= resourceLevel.full) {
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
    let resourceTypes: ResourceConstant[] = [RESOURCE_ENERGY];
    let energyResourceLevel: ResourceLevel | undefined;
    switch (structure.structureType) {
      case "container":
        resourceTypes = MineralResources.concat(resourceTypes.concat(Object.keys(structure.store) as ResourceConstant[]));
        if (isSourceStructure)
          energyResourceLevel = ResourceLevels.energy.containerSource;
        else if (isControllerStructure)
          energyResourceLevel = ResourceLevels.energy.containerController;
        break;
      case "link":
        resourceTypes = MineralResources.concat(resourceTypes.concat(Object.keys(structure.store) as ResourceConstant[]));
        if (isSourceStructure)
          energyResourceLevel = ResourceLevels.energy.linkSource;
        else if (isControllerStructure)
          energyResourceLevel = ResourceLevels.energy.linkController;
        else if (isHearthStructure)
          energyResourceLevel = ResourceLevels.energy.linkHearth;
        break;
      case "extension":
        resourceTypes = resourceTypes.concat(Object.keys(structure.store) as ResourceConstant[]);
        energyResourceLevel = ResourceLevels.energy.extension;
        break;
      case "spawn":
        resourceTypes = resourceTypes.concat(Object.keys(structure.store) as ResourceConstant[]);
        energyResourceLevel = ResourceLevels.energy.spawn;
        break;
      case "tower":
        resourceTypes = resourceTypes.concat(Object.keys(structure.store) as ResourceConstant[]);
        energyResourceLevel = ResourceLevels.energy.tower;
        break;
      case "storage":
        resourceTypes = MineralResources.concat(resourceTypes.concat(Object.keys(structure.store) as ResourceConstant[]));
        energyResourceLevel = ResourceLevels.energy.storage;
        break;
      case "terminal":
        resourceTypes = MineralResources.concat(resourceTypes.concat(Object.keys(structure.store) as ResourceConstant[]));
        energyResourceLevel = ResourceLevels.energy.terminal;
        break;
      // skip default case
    }

    resourceTypes = uniq(resourceTypes);
    forEach(resourceTypes, (resourceType) => {

      if (resourceType === RESOURCE_ENERGY) {
        if (energyResourceLevel)
          this.ControlResourceLevel(
            structure,
            jobs,
            energyResourceLevel,
            resourceType
          );
      } else {
        const resourceLevel = this.GetResourceLevel(resourceType);
        this.ControlResourceLevel(structure, jobs, resourceLevel, resourceType);
      }
    });
  }
}
