import { forOwn, sum } from "lodash";
import CreepData from "../Helper/Creep/memory";
import StructureData from "../Helper/Structure/memory";
import RoomPositionHelper from "../Helper/Room/position";
import CachePredicates from "../Cache/predicates";
import JobData from "../Helper/Job/memory";
import DroppedResourceData from "../Helper/DroppedResource/memory";

interface IResourceStorage {
  object: StructuresWithStorage | Creep;
  requiredStorageLevel: StorageLevels;
  executer: string;
  type: JobObjectExecuter;
  memory: StructureMemory | CreepMemory | undefined;
  cache: StructureCache | CreepCache | undefined;
  IsObjectEmptyEnough(structure?: StructuresWithStorage): LevelCheckResult;
  IsObjectFullEnough(structure?: StructuresWithStorage): LevelCheckResult;
  FindStructureToFillFrom(
    inRoomRange: number,
    onlyLinks: boolean,
    isFromControllerOrSource: boolean
  ): BestStructureLoop | BestDroppedResourceLoop | null;
  FindStructureToEmptyTo(
    inRoomRange: number,
    onlyLinks: boolean,
    isFromControllerOrSource: boolean
  ): BestStructureLoop | null;
  Manage():
    | { jobId?: string; memory: CreepMemory | StructureMemory }
    | undefined;
}

export default class ResourceStorage implements IResourceStorage {
  private energyWithdrawStructureTypes: StructureConstant[] = [
    "container",
    "link",
    "storage",
    "terminal",
  ];

  private energyTransferStructureTypes: StructureConstant[] = [
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
    this.requiredStorageLevel = ResourceStorage.GetRequiredStorageLevels(
      object,
      false
    );
    this.executer = executer;
    this.type = type;
    if (type === "Structure") {
      const result = StructureData.GetMemory(object.id);
      this.memory = result.memory as StructureMemory;
      this.cache = result.cache as StructureCache;
    } else {
      const result = CreepData.GetMemory((object as Creep).id);
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
      const result = CreepData.GetMemory(id);
      if (result.success) memory = result.memory as CreepMemory;
    } else if (target === "structure") {
      const result = StructureData.GetMemory(id);
      if (result.success) memory = result.memory as StructureMemory;
    } else if (target === "droppedResource") {
      const result = DroppedResourceData.GetMemory(id);
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

  static GetRequiredStorageLevels(
    object: StructuresWithStorage | Creep,
    isFromControllerOrSource: boolean
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
    const averageToCapacity: StorageLevels = {
      max: capacity,
      high: capacity * 0.8,
      low: capacity * 0.2,
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

      const structureMemory = StructureData.GetMemory(structure.id)
        .memory as StructureMemory;
      if (structureMemory && structureMemory.isSourceStructure) {
        if (isFromControllerOrSource) return fillToCapacity;
        return emptyToZero;
      }
      if (
        structure.structureType === STRUCTURE_CONTAINER ||
        structure.structureType === STRUCTURE_LINK
      ) {
        if (
          structure.room.controller &&
          structure.pos.inRangeTo(structure.room.controller, 3)
        ) {
          if (isFromControllerOrSource) return emptyToZero;
          return fillToCapacity;
        }
      }

      switch (structure.structureType) {
        case "container":
          return averageToCapacity;
        case "link":
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
      : ResourceStorage.GetRequiredStorageLevels(object, false);
    return { result: levels.current <= levels.low, level: levels };
  }

  IsObjectFullEnough(object?: StructuresWithStorage | Creep): LevelCheckResult {
    const levels = !object
      ? this.requiredStorageLevel
      : ResourceStorage.GetRequiredStorageLevels(object, false);

    return { result: levels.current >= levels.high, level: levels };
  }

  private CanStructureBeFilled(
    object?: StructuresWithStorage | Creep,
    isFromControllerOrSource = false
  ): LevelCheckResult {
    const levels = !object
      ? this.requiredStorageLevel
      : ResourceStorage.GetRequiredStorageLevels(
          object,
          isFromControllerOrSource
        );

    if (object && levels.current < levels.high) {
      object.room.visual.circle(object.pos, {
        fill: "green",
        stroke: "green",
        radius: 0.5,
        opacity: 0.3,
      });
      object.room.visual.text(
        isFromControllerOrSource ? "AAAAAAAAA" : "BBBBBBB",
        object.pos
      );
    }

    return {
      result: levels.current < levels.high || levels.high === -1,
      level: levels,
    };
  }

  private CanStructureBeEmptied(
    object?: StructuresWithStorage | Creep,
    isFromControllerOrSource = false
  ): LevelCheckResult {
    const levels = !object
      ? this.requiredStorageLevel
      : ResourceStorage.GetRequiredStorageLevels(
          object,
          isFromControllerOrSource
        );

    if (object && levels.current >= levels.low)
      object.room.visual.circle(object.pos, {
        fill: "red",
        stroke: "red",
        radius: 0.5,
        opacity: 0.3,
      });
    return {
      result: levels.current >= levels.low || levels.low === -1,
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

  private GetStructureScore(
    structure: BestStructureLoop,
    isFilling: boolean
  ): number {
    const currentPos = this.object.pos;
    const pos = RoomPositionHelper.UnFreezeRoomPosition(structure.cache.pos);
    const distance = currentPos.getRangeTo(pos);
    const amount = isFilling
      ? structure.levels.current - structure.levels.min
      : structure.levels.max - structure.levels.current;
    return (0.4 * amount) / (0.6 * distance);
  }

  private GetDroppedResourceScore(resource: BestDroppedResourceLoop): number {
    const currentPos = this.object.pos;
    const pos = RoomPositionHelper.UnFreezeRoomPosition(resource.cache.pos);
    const distance = currentPos.getRangeTo(pos);
    const { amount } = resource;
    return (0.3 * amount) / (0.7 * distance);
  }

  private IsBestStructure(
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

  private IsBestDroppedResource(
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
    inRoomRange: number,
    onlyLinks: boolean,
    isFromControllerOrSource: boolean
  ): BestStructureLoop | BestDroppedResourceLoop | null {
    let bestStructure:
      | BestStructureLoop
      | BestDroppedResourceLoop
      | null = null;
    let bestScore = 0;
    forOwn(
      StructureData.GetAllBasedOnCache(
        "",
        false,
        [this.object.room.name],
        CachePredicates.IsStructureTypes(
          !onlyLinks ? this.energyWithdrawStructureTypes : [STRUCTURE_LINK],
          true
        ),
        CachePredicates.IsInRangeOf(
          RoomPositionHelper.UnFreezeRoomPosition(this.object.pos),
          inRoomRange
        )
      ),
      (data, id: string) => {
        const structure = Game.getObjectById<StructuresWithStorage | null>(id);
        if (structure) {
          const levelCheck = this.CanStructureBeEmptied(
            structure,
            isFromControllerOrSource
          );

          if (
            levelCheck.result &&
            levelCheck.level.max - levelCheck.level.current >= 0 &&
            levelCheck.level.current > 0
          ) {
            const structureLoop: BestStructureLoop = {
              cache: data.cache as StructureCache,
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
        DroppedResourceData.GetAllBasedOnCache(
          "",
          false,
          [this.object.room.name],
          CachePredicates.IsInRangeOf(
            RoomPositionHelper.UnFreezeRoomPosition(this.object.pos),
            inRoomRange
          )
        ),
        (data, id: string) => {
          const resource = Game.getObjectById<Resource | null>(id);
          if (resource) {
            const levelCheck = ResourceStorage.CanDroppedResourceBeEmptied(
              resource
            );
            if (levelCheck.result && levelCheck.level.current > 0) {
              const droppedResourceLoop: BestDroppedResourceLoop = {
                cache: data.cache as DroppedResourceCache,
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

  FindStructureToEmptyTo(
    inRoomRange: number,
    onlyLinks: boolean,
    isFromControllerOrSource: boolean
  ): BestStructureLoop | null {
    let bestStructure: BestStructureLoop | null = null;
    let bestScore = 0;
    forOwn(
      StructureData.GetAllBasedOnCache(
        "",
        false,
        [this.object.room.name],
        CachePredicates.IsStructureTypes(
          !onlyLinks ? this.energyTransferStructureTypes : [STRUCTURE_LINK],
          true
        ),
        CachePredicates.IsInRangeOf(
          RoomPositionHelper.UnFreezeRoomPosition(this.object.pos),
          inRoomRange
        )
      ),
      (data, id: string) => {
        const structure = Game.getObjectById<StructuresWithStorage | null>(id);
        if (structure) {
          const levelCheck = this.CanStructureBeFilled(
            structure,
            isFromControllerOrSource
          );
          console.log(
            this.object,
            levelCheck.result,
            levelCheck.level.current,
            levelCheck.level.min,
            structure
          );
          if (
            levelCheck.result &&
            levelCheck.level.current - levelCheck.level.min >= 0
          ) {
            const structureLoop: BestStructureLoop = {
              cache: data.cache as StructureCache,
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

  private ManageJob(
    thisLevel: LevelCheckResult,
    isSpending: boolean,
    targetStructureInformation?: BestStructureLoop,
    targetResourceInformation?: BestDroppedResourceLoop
  ): string | undefined {
    if (!this.memory || !this.cache) return undefined;
    const targetDataResult = targetStructureInformation
      ? StructureData.GetMemory(targetStructureInformation?.id ?? "")
      : DroppedResourceData.GetMemory(targetResourceInformation?.id ?? "");
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
      const jobId = JobData.GetJobId(type, targetCache.pos);
      let jobData = JobData.GetMemory(jobId);
      if (!jobData.success) {
        jobData = JobData.Initialize({
          executer: this.executer,
          pos: targetCache.pos,
          targetId: id,
          type,
          amountToTransfer: amountRequired,
          fromTargetId: this.object.id,
          objectType: this.type,
        });

        if (!jobData.success) {
          return undefined;
        }
      }

      if (isSpending) {
        targetMemory.energyIncoming[this.object.id] = amountTransferring;
        this.memory.energyOutgoing[id] = amountTransferring;
      } else {
        targetMemory.energyOutgoing[this.object.id] = amountTransferring;
        this.memory.energyIncoming[id] = amountTransferring;
      }

      console.log(
        "Add",
        jobId,
        this.object.id,
        `${targetMemory.energyIncoming[this.object.id]} - ${
          targetMemory.energyOutgoing[this.object.id]
        }`
      );
      if (targetStructureInformation)
        StructureData.UpdateMemory(id, targetMemory);
      else DroppedResourceData.UpdateMemory(id, targetMemory);
      if (this.type === "Structure") {
        StructureData.UpdateMemory(
          this.object.id,
          this.memory as StructureMemory
        );
      } else if (this.type === "Resource") {
        DroppedResourceData.UpdateMemory(
          this.object.id,
          this.memory as DroppedResourceMemory
        );
      } else {
        return jobId;
      }
    }
    return undefined;
  }

  Manage(
    fillFrom = true,
    emptyTo = true,
    onlyLinks = false,
    isFromControllerOrSource = false,
    inRoomRange = 999
  ): { jobId?: string; memory: CreepMemory | StructureMemory } | undefined {
    if (!this.memory || !this.cache) return undefined;

    const levelFullCheck = this.IsObjectFullEnough();
    const levelEmptyCheck = this.IsObjectEmptyEnough();
    if (fillFrom) {
      const targetInformation = this.FindStructureToFillFrom(
        inRoomRange,
        onlyLinks,
        isFromControllerOrSource
      );
      if (targetInformation) {
        const targetStructureInformation = targetInformation as BestStructureLoop;
        const targetDroppedResourceInformation = targetInformation as BestDroppedResourceLoop;
        return {
          jobId: this.ManageJob(
            levelEmptyCheck,
            false,
            targetStructureInformation.levels
              ? targetStructureInformation
              : undefined,
            targetDroppedResourceInformation.amount
              ? targetDroppedResourceInformation
              : undefined
          ),
          memory: this.memory,
        };
      }
    }

    if (emptyTo) {
      const targetStructureInformation = this.FindStructureToEmptyTo(
        inRoomRange,
        onlyLinks,
        isFromControllerOrSource
      );
      if (targetStructureInformation) {
        return {
          jobId: this.ManageJob(
            levelFullCheck,
            true,
            targetStructureInformation
          ),
          memory: this.memory,
        };
      }
    }
    return undefined;
  }
}
