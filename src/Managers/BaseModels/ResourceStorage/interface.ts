import { forOwn, sum } from "lodash";
import ICreepData from "../Helper/Creep/creepMemory";
import IStructureData from "../Helper/Structure/structureMemory";
import IStructureCache from "../Cache/structureInterface"
import IRoomPosition from "../Helper/Room/roomPosition";
import Predicates from "../Cache/predicates";
import IJobMemory from "../Helper/Job/jobMemory";

interface IResourceStorage {
  object: StructuresWithStorage | Creep;
  requiredStorageLevel: StorageLevels;
  executer: string;
  type: "creep" | "structure";
  memory: StructureMemory | CreepMemory | undefined;
  cache: StructureCache | CreepCache | undefined;
  GetRequiredStorageLevels(
    object: StructuresWithStorage | Creep
  ): StorageLevels;
  IsStructureEmptyEnough(
    structure?: StructuresWithStorage
  ): { emptyEnough: boolean; levels: StorageLevels };
  IsStructureFullEnough(
    structure?: StructuresWithStorage
  ): { fullEnough: boolean; levels: StorageLevels };
  GetClosestBestStructure(
    structure: BestStructureLoop,
    bestStructure: BestStructureLoop,
    isFilling: boolean
  ): BestStructureLoop;
  FindStructureToFillFrom(): BestStructureLoop | null;
  FindStructureToEmptyTo(): BestStructureLoop | null;
  Manage(): boolean;
}

export default class implements IResourceStorage {
  object: StructuresWithStorage | Creep;

  requiredStorageLevel: StorageLevels;

  executer: string;

  type: "creep" | "structure";

  memory: StructureMemory | CreepMemory | undefined;

  cache: StructureCache | CreepCache | undefined;

  constructor(
    object: StructuresWithStorage | Creep,
    type: "creep" | "structure",
    executer: string
  ) {
    this.object = object;
    this.requiredStorageLevel = this.GetRequiredStorageLevels(object);
    this.executer = executer;
    this.type = type;
    if (type === "structure") {
      const result = IStructureData.GetMemory(object.id);
      this.memory = result.memory as StructureMemory;
      this.cache = result.cache as StructureCache;
    } else {
      const result = ICreepData.GetMemory(ICreepData.GetCreepId((object as Creep).name));
      this.memory = result.memory as CreepMemory;
      this.cache = result.cache as CreepCache;
    }
  }

  GetRequiredStorageLevels(
    object: StructuresWithStorage | Creep
  ): StorageLevels {
    const capacity = object.store.getCapacity(RESOURCE_ENERGY) ?? -1;
    const used =
      object.store.getUsedCapacity(RESOURCE_ENERGY) ??
      0 +
        (this.memory
          ? sum(
              Object.values(
                this.type === "structure" ? (this.memory as StructureMemory).energyIncoming : {}
              )
            ) - sum(Object.values(this.memory.energyOutgoing))
          : 0);

    const fillToCapacity: StorageLevels = {
      max: -1,
      high: -1,
      low: capacity,
      min: capacity,
      current: used,
    };
    const emptyToZero: StorageLevels = {
      max: 0,
      high: 0,
      low: -1,
      min: -1,
      current: used,
    };

    if ((object as Structure).structureType) {
      const structure = object as StructuresWithStorage;
      const structureMemory = this.memory as StructureMemory;
      if (structureMemory && structureMemory.isSourceStructure) {
        return emptyToZero;
        // return {
        //     max: Math.min(capacity /2, 1000),
        //     high: Math.min(capacity /4, 500),
        //     low: -1,
        //     min: -1,
        //     current: used,
        // };
      }

      switch (structure.structureType) {
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
    } else {
      return {
        max:capacity,
        high:capacity *0.9,
        min:0,
        low:capacity * 0.1,
        current: used,
      }
      // return {
      //   max:0,
      //   high:capacity *0.1,
      //   min:capacity,
      //   low:capacity * 0.9,
      //   current: used,
      // }
    }
  }

  IsStructureEmptyEnough(
    object?: StructuresWithStorage | Creep
  ): { emptyEnough: boolean; levels: StorageLevels } {
    const levels = !object
      ? this.requiredStorageLevel
      : this.GetRequiredStorageLevels(object);
    return { emptyEnough: levels.current <= levels.low, levels };
  }

  IsStructureFullEnough(
    object?: StructuresWithStorage | Creep
  ): { fullEnough: boolean; levels: StorageLevels } {
    const levels = !object
      ? this.requiredStorageLevel
      : this.GetRequiredStorageLevels(object);
    return { fullEnough: levels.current >= levels.high, levels };
  }

  GetClosestBestStructure(
    structure: BestStructureLoop,
    bestStructure: BestStructureLoop,
    isFilling: boolean
  ): BestStructureLoop {
    const currentPos = this.object.pos;
    const newPos = IRoomPosition.UnFreezeRoomPosition(structure.cache.pos);
    const bestPos = IRoomPosition.UnFreezeRoomPosition(bestStructure.cache.pos);

    const distance = currentPos.getRangeTo(newPos);
    const bestDistance = currentPos.getRangeTo(bestPos);

    const level = structure.levels;
    const bestLevel = bestStructure.levels;
    if (isFilling ? level.max === -1 : level.min === -1) return bestStructure;

    // TODO: Get level based on % filled
    const newScore =
      (distance / bestDistance) * 60 +
      (bestLevel.current / bestLevel.max / (level.current / level.max)) * 40;
    const bestScore =
      (bestDistance / distance) * 60 +
      (level.current / level.max / (bestLevel.current / bestLevel.max)) * 40;

    if (isFilling ? newScore < bestScore : newScore > bestScore) {
      return structure;
    }
    return bestStructure;
  }

  FindStructureToFillFrom(): BestStructureLoop | null {
    let bestStructure: BestStructureLoop | null = null;
    forOwn(
      IStructureCache.GetAll(
        "",
        false,
        [this.object.room.name],
        Predicates.IsStructureTypes(
          ["spawn", "extension", "tower", "lab"],
          false
        )
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
    return bestStructure;
  }

  FindStructureToEmptyTo(): BestStructureLoop | null {
    let bestStructure: BestStructureLoop | null = null;
    forOwn(
      IStructureCache.GetAll("", false, [this.object.room.name]),
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
              bestStructure,
              true
              );
            }
          }
        });
    return bestStructure;
  }

  Manage(fillFrom = true, emptyTo = true): boolean {
    // const structureMemoryResult = IStructureMemory.Get(this.object.id);
    // const structureCacheResult = IStructureCache.Get(this.object.id);
    // if (!structureMemoryResult.success) return;
    // const structureMemory = structureMemoryResult.data as StructureMemory;
    // const structureCache = structureCacheResult.data as StructureCache;
    if (!this.memory || !this.cache) return false;

    const isFullEnough = this.IsStructureFullEnough();
    const isEmptyEnough = this.IsStructureEmptyEnough();
    if (fillFrom && isFullEnough.fullEnough) {
      const targetStructureInformation = this.FindStructureToEmptyTo();
      if (targetStructureInformation) {
        const targetDataResult = IStructureData.GetMemory(
          targetStructureInformation.id
          );
        if (targetDataResult.success) {
          const targetMemory = targetDataResult.memory as StructureMemory;
          const amountToTransfer = Math.min(
            (isFullEnough.levels.current -
              targetStructureInformation.levels.current) /
              2,
            targetStructureInformation.levels.max -
              targetStructureInformation.levels.current
          );
          console.log(isFullEnough.levels.current,
            targetStructureInformation.levels.max,            targetStructureInformation.levels.max -
            targetStructureInformation.levels.current);
          const isTypeSpawning = ([
            "spawn",
            "extension",
          ] as StructureConstant[]).includes(
            targetStructureInformation.cache.type
          );
          const type = isTypeSpawning ? "TransferSpawn" : "TransferStructure";
          const jobResult = IJobMemory.Initialize({
            executer: this.executer,
            pos: this.cache.pos,
            targetId: targetStructureInformation.id,
            type,
            amountToTransfer,
            fromTargetId: this.object.id,
          });
          if (!jobResult.success) return false;
          const jobId = IJobMemory.GetJobId(type, this.cache.pos);
          targetMemory.energyIncoming[jobId] = amountToTransfer;
          IStructureData.UpdateMemory(targetStructureInformation.id, targetMemory);
          if (this.type === "structure") {
            (this.memory as StructureMemory).energyOutgoing[
              jobId
            ] = amountToTransfer;
            IStructureData.UpdateMemory(
              this.object.id,
              this.memory as StructureMemory
            );
          } else {
            ICreepData.UpdateMemory(this.object.id, this.memory as CreepMemory);
          }
          return true;
        }
      } else {
        // create job without target
      }
    }

    if (emptyTo && isEmptyEnough.emptyEnough) {
      const targetStructureInformation = this.FindStructureToFillFrom();
      if (targetStructureInformation) {
        const targetDataResult = IStructureData.GetMemory(
          targetStructureInformation.id
        );
        if (targetDataResult.success) {
          const targetMemory = targetDataResult.memory as StructureMemory;
          const amountToTransfer = Math.min(
            (targetStructureInformation.levels.current -
              isEmptyEnough.levels.min) /
              2,
            isEmptyEnough.levels.max - isEmptyEnough.levels.current
          );
          const jobType = "TransferStructure";
          const jobResult = IJobMemory.Initialize({
            executer: this.executer,
            pos: this.cache.pos,
            targetId: this.object.id,
            type: jobType,
            amountToTransfer,
            fromTargetId: targetStructureInformation.id,
          });
          if (!jobResult.success) return false;
          const jobId = IJobMemory.GetJobId(jobType, this.cache.pos);
          targetMemory.energyOutgoing[jobId] = amountToTransfer;
          IStructureData.UpdateMemory(targetStructureInformation.id, targetMemory);
          if (this.type === "structure") {
            (this.memory as StructureMemory).energyIncoming[
              jobId
            ] = amountToTransfer;
            IStructureData.UpdateMemory(
              this.object.id,
              this.memory as StructureMemory
            );
          } else {
            ICreepData.UpdateMemory(this.object.id, this.memory as CreepMemory);
          }
          return true;
        }
      } else {
        // create job without target
      }
    }
    return false;
  }
}
