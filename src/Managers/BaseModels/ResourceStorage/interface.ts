import { forOwn, sum } from "lodash";
import CreepData from "../Helper/Creep/memory";
import StructureData from "../Helper/Structure/memory";
import RoomPositionHelper from "../Helper/Room/position";
import CachePredicates from "../Cache/predicates";
import DroppedResourceData from "../Helper/DroppedResource/memory";

export default class ResourceStorage {
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
      const result = new StructureData(object.id).GetData();
      this.memory = result.memory as StructureMemory;
      this.cache = result.cache as StructureCache;
    } else {
      const result = new CreepData((object as Creep).id).GetData();
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
      const result = new CreepData(id).GetData();
      if (result.success) memory = result.memory as CreepMemory;
    } else if (target === "structure") {
      const result = new StructureData(id).GetData();
      if (result.success) memory = result.memory as StructureMemory;
    } else if (target === "droppedResource") {
      const result = new DroppedResourceData(id).GetData();
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

      const structureMemory = new StructureData(structure.id).GetData()
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
      StructureData.GetAllDataBasedOnCache(
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
        DroppedResourceData.GetAllDataBasedOnCache(
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
      StructureData.GetAllDataBasedOnCache(
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

  FindTarget(
    fillFrom = true,
    emptyTo = true,
    onlyLinks = false,
    isFromControllerOrSource = false,
    inRoomRange = 999
  ): BestDroppedResourceLoop | BestStructureLoop | null {
    if (!this.memory || !this.cache) return null;

    const levelFullCheck = this.IsObjectFullEnough();
    const levelEmptyCheck = this.IsObjectEmptyEnough();
    if (fillFrom) {
      const targetInformation = this.FindStructureToFillFrom(
        inRoomRange,
        onlyLinks,
        isFromControllerOrSource
      );
      if (targetInformation) {
        targetInformation.originLevels = levelEmptyCheck.level;
        return targetInformation;
      }
    }

    if (emptyTo) {
      const targetInformation = this.FindStructureToEmptyTo(
        inRoomRange,
        onlyLinks,
        isFromControllerOrSource
      );
      if (targetInformation) {
        targetInformation.originLevels = levelFullCheck.level;
        return targetInformation;
      }
    }
    return null;
  }
}
