import IStructureMemory from "../Memory/structureInterface";
import IStructureCache from "../Cache/structureInterface";
import IRoomHelper from "../Helper/roomInterface";
import Predicates from "../Cache/predicates";
import { forOwn } from "lodash";

interface IResourceStorage {}

export default class implements IResourceStorage {
  structure: StructuresWithStorage;
  memory: StructureMemory | undefined;
  cache: StructureCache | undefined;
  requiredStorageLevel = this.GetRequiredStorageLevels();
  constructor(structure: StructuresWithStorage) {
    this.structure = structure;
    this.memory = IStructureMemory.Get(structure.id).data;
    this.cache = IStructureCache.Get(structure.id).data;
  }

  GetRequiredStorageLevels(
    forcedStructure?: StructuresWithStorage
  ): StorageLevels {
    const structure = forcedStructure ? forcedStructure : this.structure;
    const memory = this.memory;

    const capacity = structure.store.getCapacity() ?? -1;
    const used = structure.store.getUsedCapacity() ?? -1;

    const fillToCapacity: StorageLevels = {
      max: -1,
      high: -1,
      low: capacity / 2,
      min: capacity / 4,
      current: used,
    };
    const emptyToZero: StorageLevels = {
      max: capacity / 2,
      high: capacity / 4,
      low: capacity / 8,
      min: 0,
      current: used,
    };

    if (memory && memory.isSourceStructure) {
      return emptyToZero;
      // return {
      //     max: Math.min(capacity /2, 1000),
      //     high: Math.min(capacity /4, 500),
      //     low: -1,
      //     min: -1,
      //     current: used,
      // };
    }

    switch (this.structure.structureType) {
      case "container":
      case "extension":
      case "lab":
      case "spawn":
        return fillToCapacity;
      case "storage":
        return {
          max: 500 * 1000,
          high: 400 * 1000,
          low: 250 * 1000,
          min: 100 * 1000,
          current: used,
        };
      case "terminal":
        return {
          max: 50 * 1000,
          high: 40 * 1000,
          low: 25 * 1000,
          min: 10 * 1000,
          current: used,
        };
      default:
        return fillToCapacity;
    }
  }

  IsStructureEmptyEnough(
    structure?: StructuresWithStorage
  ): { emptyEnough: boolean; levels: StorageLevels } {
    const levels = !structure
      ? this.requiredStorageLevel
      : this.GetRequiredStorageLevels(structure);
    return { emptyEnough: levels.current <= levels.low, levels };
  }
  IsStructureFullEnough(
    structure?: StructuresWithStorage
  ): { fullEnough: boolean; levels: StorageLevels } {
    const levels = !structure
      ? this.requiredStorageLevel
      : this.GetRequiredStorageLevels(structure);
    return { fullEnough: levels.current >= levels.high, levels };
  }
  GetClosestBestStructure(
    structure: BestStructureLoop,
    bestStructure: BestStructureLoop,
    isFilling:boolean
  ): BestStructureLoop {
    const currentPos = this.structure.pos;
    const newPos = IRoomHelper.UnfreezeRoomPosition(structure.cache.pos);
    const bestPos = IRoomHelper.UnfreezeRoomPosition(bestStructure.cache.pos);

    const distance = currentPos.getRangeTo(newPos);
    const bestDistance = currentPos.getRangeTo(bestPos);

    const level = structure.levels;
    const bestLevel = bestStructure.levels;

    const newScore =
      (distance / bestDistance) * 60 + (bestLevel.current / level.current) * 40;
    const bestScore =
      (bestDistance / distance) * 60 + (level.current / bestLevel.current) * 40;


    if (isFilling ?  newScore < bestScore : newScore > bestScore) {
      return structure;
    }
    return bestStructure;
  }
  FindStructureToFillFrom(): StructuresWithStorage | null {
    let bestStructure: BestStructureLoop | null = null;
    forOwn(
      IStructureCache.GetAll(
        "",
        false,
        Predicates.IsStructureTypes(["spawn", "extension", "tower", "lab"],false)
      ),
      (cache: StructureCache, id: string) => {
        const structure = Game.getObjectById<StructuresWithStorage | null>(id);
        if (structure) {
          const isFullEnough = this.IsStructureFullEnough(structure);
          if (isFullEnough.fullEnough) {
            const structureLoop: BestStructureLoop = {
              cache,
              id,
              levels: isFullEnough.levels,
            };
            if (!bestStructure) bestStructure = structureLoop;
            bestStructure = this.GetClosestBestStructure(
              structureLoop,
              bestStructure,
              false
            );
          }
        }
      }
    );
    return bestStructure
    ? Game.getObjectById<StructuresWithStorage>((bestStructure as BestStructureLoop).id)
    : null;
  }
  FindStructureToEmptyTo(): StructuresWithStorage | null {
    let bestStructure: BestStructureLoop | null = null;
    forOwn(
      IStructureCache.GetAll(
        "",
        false
              ),
      (cache: StructureCache, id: string) => {
        const structure = Game.getObjectById<StructuresWithStorage | null>(id);
        if (structure) {
          const isEmptyEnough = this.IsStructureEmptyEnough(structure);
          if (isEmptyEnough.emptyEnough) {
            const structureLoop: BestStructureLoop = {
              cache,
              id,
              levels: isEmptyEnough.levels,
            };
            if (!bestStructure) bestStructure = structureLoop;
            bestStructure = this.GetClosestBestStructure(
              structureLoop,
              bestStructure,true
            );
          }
        }
      }
    );
    return bestStructure
    ? Game.getObjectById<StructuresWithStorage>((bestStructure as BestStructureLoop).id)
    : null;
  }
}
