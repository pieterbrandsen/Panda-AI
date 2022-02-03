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
  FindStructureToFillFrom(
    inRoomRange: number
  ): BestStructureLoop | BestDroppedResourceLoop | null;
  FindStructureToEmptyTo(inRoomRange: number): BestStructureLoop | null;
  Manage(): string | undefined;
}

export default class ResourceStorage implements IResourceStorage {
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
      const result = ICreepData.GetMemory((object as Creep).id);
      this.memory = result.memory as CreepMemory;
      this.cache = result.cache as CreepCache;
    }
  }

  static GetActualAmountInStore(
    id: string,
    target: "creep" | "structure" | "droppedResource",
    amount: number
  ): number {
    let memory:
      | DroppedResourceMemory
      | StructureMemory
      | CreepMemory
      | null = null;
    if (target === "creep") {
      const result = ICreepData.GetMemory(id);
      if (result.success) memory = result.memory as CreepMemory;
    } else if (target === "structure") {
      const result = IStructureData.GetMemory(id);
      if (result.success) memory = result.memory as StructureMemory;
    } else if (target === "droppedResource") {
      const result = IDroppedResourceData.GetMemory(id);
      if (result.success) memory = result.memory as DroppedResourceMemory;
    }

    if (memory) {
      return (
        amount +
        sum(Object.values(memory.energyIncoming)) -
        sum(Object.values(memory.energyOutgoing))
      );
    }
    return amount;
  }

  GetRequiredStorageLevels(
    object: StructuresWithStorage | Creep
  ): StorageLevels {
    const type: "creep" | "structure" = (object as Structure).structureType
      ? "structure"
      : "creep";
    const capacity = object.store.getCapacity(RESOURCE_ENERGY) ?? -1;
    const used = ResourceStorage.GetActualAmountInStore(
      object.id,
      type,
      object.store.getUsedCapacity(RESOURCE_ENERGY)
    );

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

    if (type === "structure") {
      const structure = object as StructuresWithStorage;
      const structureMemory = this.memory as StructureMemory;
      if (structureMemory && structureMemory.isSourceStructure) {
        return emptyToZero;
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
        max: capacity,
        high: capacity * 0.9,
        min: 0,
        low: capacity * 0.1,
        current: used,
      };
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

  static CanDroppedResourceBeEmptied(resource: Resource): LevelCheckResult {
    const amount = ResourceStorage.GetActualAmountInStore(
      resource.id,
      "droppedResource",
      resource.amount
    );
    const levels: StorageLevels = {
      current: amount,
      low: 0,
      min: 0,
      high: amount,
      max: amount,
    };
    return {
      result: amount > 100,
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

  GetStructureScore(structure: BestStructureLoop, isFilling: boolean): number {
    const currentPos = this.object.pos;
    const pos = IRoomPosition.UnFreezeRoomPosition(structure.cache.pos);
    const distance = currentPos.getRangeTo(pos);
    const amount = isFilling
      ? structure.levels.current - structure.levels.min
      : structure.levels.max - structure.levels.current;
    return (0.4 * amount) / (0.6 * distance);
  }

  GetDroppedResourceScore(resource: BestDroppedResourceLoop): number {
    const currentPos = this.object.pos;
    const pos = IRoomPosition.UnFreezeRoomPosition(resource.cache.pos);
    const distance = currentPos.getRangeTo(pos);
    const { amount } = resource;
    return (0.3 * amount) / (0.7 * distance);
  }

  IsBestStructure(
    structure: BestStructureLoop,
    isFilling: boolean,
    bestScore: number
  ): number | void {
    const score = this.GetStructureScore(structure, isFilling);
    if (score > bestScore) {
      return score;
    }

    return undefined;
  }

  IsBestDroppedResource(
    resource: BestDroppedResourceLoop,
    bestScore: number
  ): number | void {
    const score = this.GetDroppedResourceScore(resource);

    if (score > bestScore) {
      return score;
    }

    return undefined;
  }

  FindStructureToFillFrom(
    inRoomRange: number
  ): BestStructureLoop | BestDroppedResourceLoop | null {
    let bestStructure:
      | BestStructureLoop
      | BestDroppedResourceLoop
      | null = null;
    let bestScore = 0;
    forOwn(
      IStructureCache.GetAll(
        "",
        false,
        [this.object.room.name],
        CachePredicates.IsStructureTypes(
          this.energyWithdrawStructureTypes,
          true
        ),
        CachePredicates.IsInRangeOf(
          IRoomPosition.UnFreezeRoomPosition(this.object.pos),
          inRoomRange
        )
      ),
      (cache: StructureCache, id: string) => {
        const structure = Game.getObjectById<StructuresWithStorage | null>(id);
        if (structure) {
          const levelCheck = this.CanStructureBeEmptied(structure);
          if (
            levelCheck.result &&
            levelCheck.level.max - levelCheck.level.current > 0
          ) {
            const structureLoop: BestStructureLoop = {
              cache,
              id,
              levels: levelCheck.level,
            };
            if (!bestStructure) bestStructure = structureLoop;
            const score = this.IsBestStructure(structureLoop, false, bestScore);
            if (score) {
              bestStructure = structureLoop;
              bestScore = score;
            }
          }
        }
      }
    );

    if (this.type === "Creep") {
      forOwn(
        IDroppedResourceCache.GetAll(
          "",
          false,
          [this.object.room.name],
          CachePredicates.IsInRangeOf(
            IRoomPosition.UnFreezeRoomPosition(this.object.pos),
            inRoomRange
          )
        ),
        (cache: DroppedResourceCache, id: string) => {
          const resource = Game.getObjectById<Resource | null>(id);
          if (resource) {
            const levelCheck = ResourceStorage.CanDroppedResourceBeEmptied(
              resource
            );
            if (levelCheck.result && levelCheck.level.current > 0) {
              const droppedResourceLoop: BestDroppedResourceLoop = {
                cache,
                id,
                amount: levelCheck.level.current,
              };
              if (!bestStructure) bestStructure = droppedResourceLoop;
              const score = this.IsBestDroppedResource(
                droppedResourceLoop,
                bestScore
              );
              if (score) {
                bestStructure = droppedResourceLoop;
                bestScore = score;
              }
            }
          }
        }
      );
    }
    return bestStructure;
  }

  FindStructureToEmptyTo(inRoomRange: number): BestStructureLoop | null {
    let bestStructure: BestStructureLoop | null = null;
    let bestScore = 0;
    forOwn(
      IStructureCache.GetAll(
        "",
        false,
        [this.object.room.name],
        CachePredicates.IsStructureTypes(
          this.energyTransferStructureTypes,
          true
        ),
        CachePredicates.IsInRangeOf(
          IRoomPosition.UnFreezeRoomPosition(this.object.pos),
          inRoomRange
        )
      ),
      (cache: StructureCache, id: string) => {
        const structure = Game.getObjectById<StructuresWithStorage | null>(id);
        if (structure) {
          const levelCheck = this.CanStructureBeFilled(structure);
          if (
            levelCheck.result &&
            levelCheck.level.current - levelCheck.level.min > 0
          ) {
            const structureLoop: BestStructureLoop = {
              cache,
              id,
              levels: levelCheck.level,
            };
            if (!bestStructure) bestStructure = structureLoop;
            const score = this.IsBestStructure(structureLoop, true, bestScore);
            if (score) {
              bestStructure = structureLoop;
              bestScore = score;
            }
          }
        }
      }
    );
    return bestStructure;
  }

  ManageJob(
    thisLevel: LevelCheckResult,
    isSpending: boolean,
    targetStructureInformation?: BestStructureLoop,
    targetResourceInformation?: BestDroppedResourceLoop
  ): string | undefined {
    if (!this.memory || !this.cache) return;
    const targetDataResult = targetStructureInformation
      ? IStructureData.GetMemory(targetStructureInformation?.id ?? "")
      : IDroppedResourceData.GetMemory(targetResourceInformation?.id ?? "");
    if (targetDataResult.success) {
      const targetMemory = targetDataResult.memory as
        | StructureMemory
        | DroppedResourceMemory;
      const targetCache = targetDataResult.cache as
        | StructureCache
        | DroppedResourceCache;
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
      const jobId = IJobData.GetJobId(type, targetCache.pos);
      let jobData = IJobData.GetMemory(jobId);
      if (!jobData.success) {
        jobData = IJobData.Initialize({
          executer: this.executer,
          pos: targetCache.pos,
          targetId: id,
          type,
          amountToTransfer: amountRequired,
          fromTargetId: this.object.id,
          objectType: this.type,
        });

        if (!jobData.success) {
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
      } else if (this.type === "Resource") {
        IDroppedResourceData.UpdateMemory(
          this.object.id,
          this.memory as DroppedResourceMemory
        );
      }
      else {
        return id;
      }
    }
  }

  Manage(fillFrom = true, emptyTo = true, inRoomRange = 999): string | undefined {
    // const structureMemoryResult = IStructureMemory.Get(this.object.id);
    // const structureCacheResult = IStructureCache.Get(this.object.id);
    // if (!structureMemoryResult.success) return;
    // const structureMemory = structureMemoryResult.data as StructureMemory;
    // const structureCache = structureCacheResult.data as StructureCache;
    if (!this.memory || !this.cache) return undefined;

    const levelFullCheck = this.IsObjectFullEnough();
    const levelEmptyCheck = this.IsObjectEmptyEnough();
    if (fillFrom) {
      const targetInformation = this.FindStructureToFillFrom(inRoomRange);
      if (targetInformation) {
        const targetStructureInformation = targetInformation as BestStructureLoop;
        const targetDroppedResourceInformation = targetInformation as BestDroppedResourceLoop;
        return this.ManageJob(
          levelEmptyCheck,
          false,
          targetStructureInformation.levels
            ? targetStructureInformation
            : undefined,
          targetDroppedResourceInformation.amount
            ? targetDroppedResourceInformation
            : undefined
        );
      }
    }

    if (emptyTo) {
      const targetStructureInformation = this.FindStructureToEmptyTo(
        inRoomRange
      );
      if (targetStructureInformation) {
        return this.ManageJob(levelFullCheck, true, targetStructureInformation);
      }
    }
  }
}
