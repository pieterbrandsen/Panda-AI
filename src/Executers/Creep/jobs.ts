import { forOwn } from "lodash";
import CreepData from "../../Managers/BaseModels/Helper/Creep/memory";
import DroppedResourceData from "../../Managers/BaseModels/Helper/DroppedResource/memory";
import JobData from "../../Managers/BaseModels/Helper/Job/memory";
import RoomData from "../../Managers/BaseModels/Helper/Room/memory";
import StructureData from "../../Managers/BaseModels/Helper/Structure/memory";
import JobsHelper from "../../Managers/BaseModels/Jobs/interface";
import MemoryPredicates from "../../Managers/BaseModels/Memory/predicates";
import ResourceStorage from "../../Managers/BaseModels/ResourceStorage/interface";

export default class CreepJobs extends JobsHelper {
  protected _creepInformation: CreepInformation;

  protected _creepDataRepo: CreepData;

  protected _targetStructureDataRepo: StructureData;

  protected _targetDroppedResourceDataRepo: DroppedResourceData;

  constructor(creepInformation: CreepInformation) {
    super();
    this._creepInformation = creepInformation;
    this._creepDataRepo = new CreepData(creepInformation.id);
    this._targetStructureDataRepo = new StructureData(
      creepInformation.jobMemory!.targetId
    );
    this._targetDroppedResourceDataRepo = new DroppedResourceData(
      creepInformation.jobMemory!.targetId
    );
  }

  public UnassignJob(saveJob: boolean): boolean {
    const memory = this._creepInformation.memory!;
    const jobMemory = this._creepInformation.jobMemory as JobMemory;
    this.RemoveAssignedCreepOutOfArray(
      jobMemory.assignedCreeps,
      this._creepInformation.id
    );

    let type: JobObjectExecuter = "Structure";
    let targetData:
      | DoubleCRUDResult<StructureMemory, StructureCache>
      | DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache>
      | null = null;
    const targetStructureData = this._targetStructureDataRepo.GetData();
    if (targetStructureData.success) {
      targetData = targetStructureData;
      type = "Structure";
    } else {
      const targetDroppedResourceData = this._targetDroppedResourceDataRepo.GetData();
      if (targetDroppedResourceData.success) {
        targetData = targetDroppedResourceData;
        type = "Resource";
      }
    }

    if (targetData && jobMemory.fromTargetId) {
      delete targetData.memory!.energyOutgoing[jobMemory.fromTargetId];
      delete targetData.memory!.energyIncoming[jobMemory.fromTargetId];

      if (type === "Structure") {
        this._targetStructureDataRepo.UpdateData(
          targetData.memory as StructureMemory,
          targetData.cache as StructureCache
        );
      } else {
        this._targetDroppedResourceDataRepo.UpdateData(
          targetData.memory as DroppedResourceMemory,
          targetData.cache as DroppedResourceCache
        );
      }
    }

    if (jobMemory.fromTargetId) {
      delete targetStructureData.memory!.energyIncoming[jobMemory.fromTargetId];
      delete targetStructureData.memory!.energyOutgoing[jobMemory.fromTargetId];
      delete jobMemory.fromTargetId;
    }
    if (saveJob) {
      memory.permJobId = memory.jobId;
    }
    delete memory.jobId;

    return this._creepDataRepo.UpdateData(memory, this._creepInformation.cache!)
      .success;
  }

  public AssignCreepJob(jobId: string): boolean {
    const jobDataRepo = new JobData(jobId);

    const creepId = this._creepInformation.id;
    const creepMemory = this._creepInformation.memory!;
    const creepCache = this._creepInformation.cache!;
    const jobMemoryResult = jobDataRepo.GetData();
    if (!jobMemoryResult.success) {
      return false;
    }
    const jobMemory = jobMemoryResult.memory as JobMemory;
    const jobCache = jobMemoryResult.cache as JobCache;
    if (jobId === creepMemory.permJobId) {
      delete creepMemory.permJobId;
    }
    if (!jobMemory.assignedCreeps.includes(creepId))
      jobMemory.assignedCreeps.push(creepId);
    creepMemory.jobId = jobId;
    creepCache.executer = jobCache.executer;
    jobMemory.fromTargetId = creepId;
    jobMemory.lastAssigned = Game.time;
    if (!jobDataRepo.UpdateData(jobMemory, jobCache).success) {
      return false;
    }

    return this._creepDataRepo.UpdateData(creepMemory, creepCache).success;
  }

  private AssignResourceJob(
    executer: string,
    objectId: string,
    isSpending: boolean,
    targetInformation: BestStructureLoop | BestDroppedResourceLoop,
    memory: CreepMemory | StructureMemory | DroppedResourceMemory,
    cache: CreepCache | StructureCache | DroppedResourceCache,
    type: JobObjectExecuter
  ): boolean {
    const { id } = targetInformation;
    const structureDataRepo = new StructureData(id);
    const droppedResourceDataRepo = new DroppedResourceData(id);
    let targetDataResult:
      | DoubleCRUDResult<StructureMemory, StructureCache>
      | DoubleCRUDResult<
          DroppedResourceMemory,
          DroppedResourceCache
        > = structureDataRepo.GetData();
    let targetType: JobObjectExecuter = "Structure";
    if (!targetDataResult.success) {
      targetDataResult = droppedResourceDataRepo.GetData();
      targetType = "Resource";
    }
    if (targetDataResult.success && targetInformation.originLevels) {
      const thisLevel = targetInformation.originLevels as StorageLevels;
      const targetMemory = targetDataResult.memory as
        | StructureMemory
        | DroppedResourceMemory;
      const targetCache = targetDataResult.cache as
        | StructureCache
        | DroppedResourceCache;
      let amountRequired = 0;
      let amountTransferring = 0;

      const targetStructureInformation = targetInformation as BestStructureLoop;
      const targetResourceInformation = targetInformation as BestDroppedResourceLoop;
      if (targetType === "Structure") {
        amountRequired = isSpending
          ? targetStructureInformation.levels.max -
            targetStructureInformation.levels.current
          : targetStructureInformation.levels.current -
            targetStructureInformation.levels.min;

        amountTransferring = isSpending
          ? Math.min(
              targetStructureInformation.levels.max -
                targetStructureInformation.levels.current,
              thisLevel.current
            )
          : Math.min(
              targetStructureInformation.levels.current -
                targetStructureInformation.levels.min,
              thisLevel.max - thisLevel.current
            );
      } else if (targetType === "Resource") {
        amountRequired = targetResourceInformation.amount;
        amountTransferring = thisLevel.max - thisLevel.current;
      }

      const isTypeSpawning =
        targetType === "Structure" && targetStructureInformation
          ? (["spawn", "extension"] as StructureConstant[]).includes(
              targetStructureInformation.cache.type
            )
          : false;
      let jobType: JobTypes = isTypeSpawning
        ? "TransferSpawn"
        : "TransferStructure";
      if (targetType === "Resource") {
        jobType = "PickupResource";
      } else if (!isSpending) {
        jobType = "WithdrawResource";
      }
      const jobId = JobData.GetJobId(jobType, targetCache.pos);
      const jobDataRepo = new JobData(jobId);
      let jobData = jobDataRepo.GetData();
      if (!jobData.success) {
        jobData = jobDataRepo.InitializeData({
          executer,
          pos: targetCache.pos,
          targetId: id,
          type: jobType,
          amountToTransfer: amountRequired,
          fromTargetId: objectId,
          objectType: targetType,
        });

        if (!jobData.success) {
          return false;
        }
      }

      if (isSpending) {
        targetMemory.energyIncoming[objectId] = amountTransferring;
        memory.energyOutgoing[id] = amountTransferring;
      } else {
        targetMemory.energyOutgoing[objectId] = amountTransferring;
        memory.energyIncoming[id] = amountTransferring;
      }

      if (targetStructureInformation)
        structureDataRepo.UpdateData(
          targetMemory as StructureMemory,
          targetCache as StructureCache
        );
      else
        droppedResourceDataRepo.UpdateData(
          targetMemory as DroppedResourceMemory,
          targetCache as DroppedResourceCache
        );
      if (type === "Structure") {
        return new StructureData(objectId).UpdateData(
          memory as StructureMemory,
          cache as StructureCache
        ).success;
      }
      if (type === "Resource") {
        return new DroppedResourceData(objectId).UpdateData(
          memory as DroppedResourceMemory,
          cache as DroppedResourceCache
        ).success;
      }

      return this.AssignCreepJob(jobId);
    }

    return true;
  }

  public FindResourceJob(
    type: JobObjectExecuter,
    fromTarget: Creep | StructuresWithStorage,
    memory: CreepMemory | StructureMemory,
    cache: CreepCache | StructureCache,
    jobTypes: JobTypes[],
    roomNames: string[],
    executer: string,
    onlyLinks: boolean
  ): boolean {
    const isFromControllerOrSource =
      (memory.permJobId !== undefined &&
        memory.permJobId.startsWith("Controller")) ||
      cache.type === "miner";
    const targetInformation = new ResourceStorage(
      fromTarget,
      type,
      executer
    ).FindTarget(
      true,
      true,
      onlyLinks,
      isFromControllerOrSource,
      isFromControllerOrSource ? 3 : undefined
    );
    if (targetInformation === null) return false;
    const isSpending = fromTarget.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
    return this.AssignResourceJob(
      executer,
      targetInformation.id,
      isSpending,
      targetInformation,
      memory,
      cache,
      type
    );
  }

  public FindJobForCreep(): boolean {
    const creep = this._creepInformation.creep!;
    const memoryResult = new CreepData(creep.id).GetData();
    if (!memoryResult.success) {
      return false;
    }
    const creepMemory = memoryResult.memory as CreepMemory;
    const creepCache = memoryResult.cache as CreepCache;

    let roomNames = [creep.room.name];
    if (creepMemory.isRemoteCreep) {
      const roomMemory = new RoomData(creep.room.name).GetData()
        .memory as RoomMemory;
      roomNames = Object.keys(roomMemory.remoteRooms ?? {});
    }

    const jobTypes = this.GetJobTypesToExecute(creep, creepCache.type);
    if (jobTypes.length === 0) {
      return false;
    }
    if (
      jobTypes.includes("TransferStructure") ||
      jobTypes.includes("TransferSpawn")
    ) {
      return this.FindResourceJob(
        "Creep",
        creep,
        creepMemory,
        creepCache,
        jobTypes,
        roomNames,
        creepCache.executer,
        false
      );
    }

    if (creepMemory.permJobId) {
      const permJobData = new JobData(creepMemory.permJobId).GetData();
      if (permJobData.success) {
        const permJobCache = permJobData.cache as JobCache;
        if (jobTypes.includes(permJobCache.type)) {
          return this.AssignCreepJob(creepMemory.permJobId);
        }
      }
    }
    const newJob = this.FindNewJob(creepCache.executer, jobTypes, roomNames);
    if (newJob !== undefined) {
      return this.AssignCreepJob(newJob.id);
    }
    return false;
  }

  public static DeleteJobData(jobId: string): boolean {
    const creepsData = CreepData.GetAllDataBasedOnMemory(
      MemoryPredicates.HasJobId(jobId)
    );
    forOwn(
      creepsData,
      (
        creepData: DoubleCRUDResult<CreepMemory, CreepCache>,
        creepId: string
      ) => {
        const jobData = new JobData(creepData.memory!.jobId).GetData();
        const creepJobHelper = new CreepJobs({
          id: creepId,
          creep: null,
          memory: creepData.memory,
          cache: creepData.cache,
          jobCache: jobData.cache,
          jobMemory: jobData.memory,
        });
        creepJobHelper.UnassignJob(false);
      }
    );

    return new JobData(jobId).DeleteData().success;
  }
}
