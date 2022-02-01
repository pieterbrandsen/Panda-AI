import { forOwn, sum } from "lodash";
import ICreepData from "../Helper/Creep/creepMemory";
import IStructureData from "../Helper/Structure/structureMemory";
import IStructureCache from "../Cache/structureInterface";
import IRoomPosition from "../Helper/Room/roomPosition";
import CachePredicates from "../Cache/predicates";
import IJobData from "../Helper/Job/jobMemory";
import IDroppedResourceCache from "../Cache/droppedResourceInterface";
import IDroppedResourceData from "../Helper/DroppedResource/droppedResourceMemory";

interface IResourceStorage {
  object: StructuresWithStorage | Creep;
  requiredStorageLevel: StorageLevels;
  executer: string;
  type: JobObjectExecuter;
  memory: StructureMemory | CreepMemory | undefined;
  cache: StructureCache | CreepCache | undefined;
  GetRequiredStorageLevels(
    object: StructuresWithStorage | Creep
  ): StorageLevels;
  IsObjectEmptyEnough(structure?: StructuresWithStorage): LevelCheckResult;
  IsObjectFullEnough(structure?: StructuresWithStorage): LevelCheckResult;
  GetClosestBestStructure(
    structure: BestStructureLoop,
    bestStructure: BestStructureLoop,
    isFilling: boolean
  ): BestStructureLoop;
  FindStructureToFillFrom(inRoomRange: number): BestStructureLoop | null;
  FindStructureToEmptyTo(inRoomRange: number): BestStructureLoop | null;
  Manage(): boolean;
}

export default class implements IResourceStorage {
  energyWithdrawStructureTypes: StructureConstant[] = [
    "container",
    "link",
    "storage",
    "terminal",
  ];

  energyTransferStructureTypes: StructureConstant[] = [
    "spawn",
    "extension",
    "tower",
    "lab",
    "container",
    "link",
    "storage",
    "terminal",
  ];

  object: StructuresWithStorage | Creep;

  requiredStorageLevel: StorageLevels;

  executer: string;

  type: JobObjectExecuter;

  memory: StructureMemory | CreepMemory | undefined;

  cache: StructureCache | CreepCache | undefined;

  constructor(
    object: StructuresWithStorage | Creep,
    type: JobObjectExecuter,
    executer: string
  ) {
    this.object = object;
    this.requiredStorageLevel = this.GetRequiredStorageLevels(object);
    this.executer = executer;
    this.type = type;
    if (type === "Structure") {
      const result = IStructureData.GetMemory(object.id);
      this.memory = result.memory as StructureMemory;
      this.cache = result.cache as StructureCache;
    } else {
      const result = ICreepData.GetMemory(
        ICreepData.GetCreepId((object as Creep).name)
      );
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
                this.type === "Structure"
                  ? (this.memory as StructureMemory).energyIncoming
                  : {}
              )
            ) - sum(Object.values(this.memory.energyOutgoing))
          : 0);

    const fillToCapacity: StorageLevels = {
      max: capacity,
      high: capacity,
      low: capacity,
      min: 0,
      current: used,
    };
    const emptyToZero: StorageLevels = {
      max: capacity,
      high: 0,
      low: 0,
      min: 0,
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
      // return {
      //   max: 0,
      //   high: capacity * 0.1,
      //   min: capacity,
      //   low: capacity * 0.9,
      //   current: used,
      // };
      return {
        max: capacity,
        high: capacity * 0.9,
        min: 0,
        low: capacity * 0.1,
        current: used,
      };
      // return {
      //   max:0,
      //   high:capacity *0.1,
      //   min:capacity,
      //   low:capacity * 0.9,
      //   current: used,
      // }
    }
  }

  IsObjectEmptyEnough(
    object?: StructuresWithStorage | Creep
  ): LevelCheckResult {
    const levels = !object
      ? this.requiredStorageLevel
      : this.GetRequiredStorageLevels(object);
    return { result: levels.current <= levels.low, level: levels };
  }

  IsObjectFullEnough(object?: StructuresWithStorage | Creep): LevelCheckResult {
    const levels = !object
      ? this.requiredStorageLevel
      : this.GetRequiredStorageLevels(object);
    return { result: levels.current >= levels.high, level: levels };
  }

  CanStructureBeFilled(
    object?: StructuresWithStorage | Creep
  ): LevelCheckResult {
    const levels = !object
      ? this.requiredStorageLevel
      : this.GetRequiredStorageLevels(object);
    return {
      result: levels.current < levels.high || levels.high === -1,
      level: levels,
    };
  }

  CanStructureBeEmptied(
    object?: StructuresWithStorage | Creep
  ): LevelCheckResult {
    const levels = !object
      ? this.requiredStorageLevel
      : this.GetRequiredStorageLevels(object);
    return {
      result: levels.current >= levels.low || levels.low === -1,
      level: levels,
    };
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

  GetClosestBestDroppedResource(
    resource: BestDroppedResourceLoop,
    bestResource: BestDroppedResourceLoop
  ): BestDroppedResourceLoop {
    const currentPos = this.object.pos;
    const newPos = IRoomPosition.UnFreezeRoomPosition(resource.cache.pos);
    const bestPos = IRoomPosition.UnFreezeRoomPosition(bestResource.cache.pos);

    const distance = currentPos.getRangeTo(newPos);
    const bestDistance = currentPos.getRangeTo(bestPos);

    const { amount } = resource;
    const bestAmount = bestResource.amount;

    // TODO: Get level based on % filled
    const newScore =
      (distance / bestDistance) * 60 +
      (bestAmount / bestAmount / (amount / amount)) * 40;
    const bestScore =
      (bestDistance / distance) * 60 +
      (amount / amount / (bestAmount / bestAmount)) * 40;

    if (newScore > bestScore) {
      return resource;
    }
    return bestResource;
  }

  FindStructureToFillFrom(inRoomRange: number): BestStructureLoop | null {
    let bestStructure: BestStructureLoop | null = null;
    forOwn(
      IStructureCache.GetAll(
        "",
        false,
        [this.object.room.name],
        CachePredicates.IsStructureTypes(
          this.energyWithdrawStructureTypes,
          true
        ),
        CachePredicates.IsInRangeOf(this.object.pos, inRoomRange)
      ),
      (cache: StructureCache, id: string) => {
        const structure = Game.getObjectById<StructuresWithStorage | null>(id);
        if (structure) {
          const levelCheck = this.CanStructureBeEmptied(structure);
          if (levelCheck.result) {
            const structureLoop: BestStructureLoop = {
              cache,
              id,
              levels: levelCheck.level,
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

  FindStructureToEmptyTo(inRoomRange: number): BestStructureLoop | null {
    let bestStructure: BestStructureLoop | null = null;
    forOwn(
      IStructureCache.GetAll(
        "",
        false,
        [this.object.room.name],
        CachePredicates.IsStructureTypes(
          this.energyTransferStructureTypes,
          true
        ),
        CachePredicates.IsInRangeOf(this.object.pos, inRoomRange)
      ),
      (cache: StructureCache, id: string) => {
        const structure = Game.getObjectById<StructuresWithStorage | null>(id);
        if (structure) {
          const levelCheck = this.CanStructureBeFilled(structure);
          if (levelCheck.result) {
            const structureLoop: BestStructureLoop = {
              cache,
              id,
              levels: levelCheck.level,
            };
            if (!bestStructure) bestStructure = structureLoop;
            bestStructure = this.GetClosestBestStructure(
              structureLoop,
              bestStructure,
              true
            );
          }
        }
      }
    );
    return bestStructure;
  }

  FindDroppedResourceToFillFrom(): BestDroppedResourceLoop | null {
    let bestDroppedResource: BestDroppedResourceLoop | null = null;
    forOwn(
      IDroppedResourceCache.GetAll("", false, [this.object.room.name]),
      (cache: DroppedResourceCache, id: string) => {
        const resource = Game.getObjectById<Resource | null>(id);
        if (resource) {
          const droppedResourceLoop: BestDroppedResourceLoop = {
            cache,
            id,
            amount: resource.amount,
          };
          if (!bestDroppedResource) bestDroppedResource = droppedResourceLoop;
          bestDroppedResource = this.GetClosestBestDroppedResource(
            droppedResourceLoop,
            bestDroppedResource
          );
        }
      }
    );
    return bestDroppedResource;
  }

  ManageJob(
    thisLevel: LevelCheckResult,
    isSpending: boolean,
    targetStructureInformation?: BestStructureLoop,
    targetResourceInformation?: BestDroppedResourceLoop
  ): void {
    if (!this.memory || !this.cache) return;
    const targetDataResult = targetStructureInformation
      ? IStructureData.GetMemory(targetStructureInformation?.id ?? "")
      : IDroppedResourceData.GetMemory(targetResourceInformation?.id ?? "");
    if (targetDataResult.success) {
      const targetMemory = targetDataResult.memory as
        | StructureMemory
        | DroppedResourceMemory;
      let amountRequired = 0;
      let amountTransferring = 0;
      let id = "";

      if (targetStructureInformation) {
        id = targetStructureInformation.id;
        amountRequired = isSpending
          ? targetStructureInformation.levels.max -
            targetStructureInformation.levels.current
          : targetStructureInformation.levels.current -
            targetStructureInformation.levels.min;

        amountTransferring = isSpending
          ? Math.min(
              targetStructureInformation.levels.max -
                targetStructureInformation.levels.current,
              thisLevel.level.current
            )
          : Math.min(
              targetStructureInformation.levels.current -
                targetStructureInformation.levels.min,
              thisLevel.level.max - thisLevel.level.current
            );
      } else if (targetResourceInformation) {
        id = targetResourceInformation.id;
        amountRequired = targetResourceInformation.amount;
        amountTransferring = thisLevel.level.max - thisLevel.level.current;
      }

      const isTypeSpawning = targetStructureInformation
        ? (["spawn", "extension"] as StructureConstant[]).includes(
            targetStructureInformation.cache.type
          )
        : false;
      let type: JobTypes = isTypeSpawning
        ? "TransferSpawn"
        : "TransferStructure";
      if (targetResourceInformation) {
        type = "WithdrawResource";
      } else if (!isSpending) {
        type = "WithdrawStructure";
      }
      const jobId = IJobData.GetJobId(type, this.cache.pos);
      const jobData = IJobData.GetMemory(jobId);
      if (!jobData.success) {
        const jobResult = IJobData.Initialize({
          executer: this.executer,
          pos: this.cache.pos,
          targetId: id,
          type,
          amountToTransfer: amountRequired,
          fromTargetId: this.object.id,
          objectType: this.type,
        });

        if (!jobResult.success) {
          return;
        }
      }

      if (isSpending) {
        targetMemory.energyIncoming[this.object.id] = amountTransferring;
        this.memory.energyOutgoing[id] = amountTransferring;
      } else {
        targetMemory.energyOutgoing[this.object.id] = amountTransferring;
        this.memory.energyIncoming[id] = amountTransferring;
      }

      if (targetStructureInformation)
        IStructureData.UpdateMemory(id, targetMemory);
      else IDroppedResourceData.UpdateMemory(id, targetMemory);
      if (this.type === "Structure") {
        IStructureData.UpdateMemory(
          this.object.id,
          this.memory as StructureMemory
        );
      } else {
        const creepName = (this.object as Creep).name;
        const creepMemory = this.memory as CreepMemory;
        creepMemory.jobId = jobId;
        ICreepData.UpdateMemory(creepName, creepMemory);
      }
    }
  }

  ManageDroppedResource(): boolean {
    if (!this.memory || !this.cache) return false;
    const targetDroppedResourceInformation = this.FindDroppedResourceToFillFrom();
    if (targetDroppedResourceInformation) {
      const levelEmptyCheck = this.IsObjectEmptyEnough();
      this.ManageJob(
        levelEmptyCheck,
        false,
        undefined,
        targetDroppedResourceInformation
      );
      return true;
    }
    return false;
  }

  Manage(fillFrom = true, emptyTo = true, inRoomRange = 50): boolean {
    // const structureMemoryResult = IStructureMemory.Get(this.object.id);
    // const structureCacheResult = IStructureCache.Get(this.object.id);
    // if (!structureMemoryResult.success) return;
    // const structureMemory = structureMemoryResult.data as StructureMemory;
    // const structureCache = structureCacheResult.data as StructureCache;
    if (!this.memory || !this.cache) return false;

    const levelFullCheck = this.IsObjectFullEnough();
    const levelEmptyCheck = this.IsObjectEmptyEnough();
    if (fillFrom) {
      const targetStructureInformation = this.FindStructureToFillFrom(
        inRoomRange
      );
      if (targetStructureInformation) {
        this.ManageJob(levelEmptyCheck, false, targetStructureInformation);
        return true;
      }
    }

    if (emptyTo) {
      const targetStructureInformation = this.FindStructureToEmptyTo(
        inRoomRange
      );
      if (targetStructureInformation) {
        this.ManageJob(levelFullCheck, true, targetStructureInformation);
        return true;
      }
    }
    return false;
  }
}
