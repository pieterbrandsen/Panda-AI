import { forEach, forOwn, remove } from "lodash";
import CreepData from "../Helper/Creep/memory";
import JobData from "../Helper/Job/memory";
import RoomData from "../Helper/Room/memory";
import Predicates from "./predicates";
import MemoryPredicates from "../Memory/predicates";
import ResourceStorage from "../ResourceStorage/interface";
import StructureData from "../Helper/Structure/memory";
import DroppedResourceData from "../Helper/DroppedResource/memory";
import RoomConstruction from "../Helper/Room/construction";
import RoomHelper from "../Helper/Room/interface";
import JobHelper from "../Helper/Job/helper";
import RoomHeapData from "../Heap/room";

// TODO: Update (all/single)
// TODO: GenerateObject (update whenever something needs to be added, assign in this function the missing data that is optional?)
// *^ LATER

export default class Jobs {
  static RemoveAssignedCreepOutOfArray(array: string[], key: string): string[] {
    remove(array, (e) => e === key);
    return array;
  }

  static UnassignStructureJob(
    structureId: string,
    memory: StructureMemory,
    saveJob: boolean
  ): boolean {
    if (memory && memory.jobId) {
      const jobData = JobData.GetMemory(memory.jobId);
      if (jobData.success) {
        const job = jobData.memory as JobMemory;
        const targetStructureData = StructureData.GetMemory(job.targetId);
        if (targetStructureData.success) {
          const targetMemory = targetStructureData.memory as StructureMemory;
          if (targetMemory && job.fromTargetId) {
            delete targetMemory.energyOutgoing[job.fromTargetId];
            delete targetMemory.energyIncoming[job.fromTargetId];

            StructureData.UpdateMemory(job.targetId, memory);
          }
        }

        delete memory.energyIncoming[job.targetId];
        delete memory.energyOutgoing[job.targetId];

        if (job.fromTargetId) delete job.fromTargetId;
      }
    }

    if (saveJob) {
      memory.permJobId = memory.jobId;
    }
    delete memory.jobId;
    return StructureData.UpdateMemory(structureId, memory).success;
  }

  static UnassignCreepJob(
    creepId: string,
    memory: CreepMemory,
    saveJob: boolean
  ): boolean {
    if (memory && memory.jobId) {
      const jobData = JobData.GetMemory(memory.jobId);
      if (jobData.success) {
        const job = jobData.memory as JobMemory;
        this.RemoveAssignedCreepOutOfArray(job.assignedCreeps, creepId);

        let type: JobObjectExecuter = "Structure";
        let targetMemory: StructureMemory | DroppedResourceMemory | null = null;
        const targetStructureData = StructureData.GetMemory(job.targetId);
        if (targetStructureData.success) {
          targetMemory = targetStructureData.memory as StructureMemory;
          type = "Structure";
        } else {
          const targetDroppedResourceData = DroppedResourceData.GetMemory(
            job.targetId
          );
          if (targetDroppedResourceData.success) {
            targetMemory = targetDroppedResourceData.memory as DroppedResourceMemory;
            type = "Resource";
          }
        }

        if (targetMemory && job.fromTargetId) {
          delete targetMemory.energyOutgoing[job.fromTargetId];
          delete targetMemory.energyIncoming[job.fromTargetId];

          if (type === "Structure") {
            StructureData.UpdateMemory(job.targetId, targetMemory);
          } else {
            DroppedResourceData.UpdateMemory(job.targetId, targetMemory);
          }
        }

        delete memory.energyIncoming[job.targetId];
        delete memory.energyOutgoing[job.targetId];

        if (job.fromTargetId) delete job.fromTargetId;
      }
    }
    if (saveJob) {
      memory.permJobId = memory.jobId;
    }
    delete memory.jobId;

    return CreepData.UpdateMemory(creepId, memory).success;
  }

  static AssignCreepJob(
    creepId: string,
    creepMemory: CreepMemory,
    creepCache: CreepCache,
    jobId: string,
    jobCache: JobCache
  ): boolean {
    const jobMemoryResult = JobData.GetMemory(jobId);
    if (!jobMemoryResult.success) {
      return false;
    }
    const jobMemory = jobMemoryResult.memory as JobMemory;
    if (jobId === creepMemory.permJobId) {
      delete creepMemory.permJobId;
    }
    if (!jobMemory.assignedCreeps.includes(creepId))
      jobMemory.assignedCreeps.push(creepId);
    creepMemory.jobId = jobId;
    creepCache.executer = jobCache.executer;
    jobMemory.fromTargetId = creepId;
    jobMemory.lastAssigned = Game.time;
    if (!JobData.UpdateMemory(jobId, jobMemory).success) {
      return false;
    }

    return CreepData.UpdateMemory(creepId, creepMemory, creepCache).success;
  }

  static AssignStructureJob(): void {}

  static AssignResourceJob(
    executer: string,
    objectId: string,
    isSpending: boolean,
    targetInformation: BestStructureLoop | BestDroppedResourceLoop,
    memory: CreepMemory | StructureMemory,
    cache: CreepCache | StructureCache,
    type: JobObjectExecuter
  ): boolean {
    let targetDataResult:
      | DoubleCRUDResult<StructureMemory, StructureCache>
      | DoubleCRUDResult<
          DroppedResourceMemory,
          DroppedResourceCache
        > = StructureData.GetMemory(targetInformation.id);
    let targetType: JobObjectExecuter = "Structure";
    if (!targetDataResult.success) {
      targetDataResult = DroppedResourceData.GetMemory(targetInformation.id);
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
      const { id } = targetInformation;

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
        jobType = "WithdrawResource";
      } else if (!isSpending) {
        jobType = "WithdrawStructure";
      }
      const jobId = JobData.GetJobId(jobType, targetCache.pos);
      let jobData = JobData.GetMemory(jobId);
      if (!jobData.success) {
        jobData = JobData.Initialize({
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
        StructureData.UpdateMemory(id, targetMemory);
      else DroppedResourceData.UpdateMemory(id, targetMemory);
      if (type === "Structure") {
        return StructureData.UpdateMemory(objectId, memory as StructureMemory)
          .success;
      }
      if (type === "Resource") {
        return DroppedResourceData.UpdateMemory(
          objectId,
          memory as DroppedResourceMemory
        ).success;
      }

      return this.AssignCreepJob(
        objectId,
        memory as CreepMemory,
        cache as CreepCache,
        jobId,
        jobData.cache as JobCache
      );
    }

    return true;
  }

  static UpdateAmount(
    jobId: string,
    memory: JobMemory,
    cache: JobCache,
    amount: number,
    sendStats = false
  ): boolean {
    if (memory.amountToTransfer) {
      memory.amountToTransfer -= amount;
    }

    if (!sendStats) return JobData.UpdateMemory(jobId, memory).success;

    const roomName = RoomHelper.GetRoomName(cache.executer);
    const globalRoomData = RoomHeapData.Get(roomName);
    if (globalRoomData.success) {
      const globalRoom = globalRoomData.data as RoomHeap;
      const jobStatsType = JobHelper.GetJobStatsType(cache.type);
      if (jobStatsType === "Incoming") {
        globalRoom.stats.energyIncoming[cache.type] += amount;
      } else if (jobStatsType === "Outgoing") {
        let amountExpense = amount;
        if (cache.type === "Repair") amountExpense /= 100;
        else if (cache.type === "Build") amountExpense /= 5;
        globalRoom.stats.energyOutgoing[cache.type] += amountExpense;
      }
    }
    return JobData.UpdateMemory(jobId, memory).success;
  }

  static MoveJob(
    id: string,
    type: "Room" | "Manager",
    newExecuter: string
  ): DoubleCRUDResult<JobMemory, JobCache> {
    const jobData = JobData.GetMemory(id);
    if (!jobData.success) {
      return { success: false, memory: undefined, cache: undefined };
    }
    const job = jobData.cache as JobCache;
    const room =
      type === "Room" ? newExecuter : RoomHelper.GetRoomName(job.executer);
    const manager =
      type === "Manager"
        ? newExecuter
        : RoomHelper.GetManagerName(job.executer);
    job.executer = RoomHelper.GetExecuter(room, manager as ManagerTypes);
    return JobData.UpdateMemory(id, undefined, job);
  }

  static GetJobScore(memory: JobMemory): number {
    if (memory.assignedCreeps.length >= (memory.maxCreepsCount ?? 100))
      return 0;

    let score = 0;
    score += (Game.time / memory.lastAssigned - 1) * Game.time;
    // if (memory.maxCreepsCount) {
    //  score += memory.assignedCreeps.length / memory.maxCreepsCount;
    // }
    return score;
  }

  static FindBestJob(jobIds: string[]): string | undefined {
    let bestJobId: string | undefined;
    let bestScore = 0;
    forEach(jobIds, (jobId: string) => {
      const jobData = JobData.GetMemory(jobId);
      if (jobData.success) {
        const jobMemory = jobData.memory as JobMemory;
        const score = this.GetJobScore(jobMemory);
        if (score > 0 && score > bestScore) {
          bestScore = score;
          bestJobId = jobId;
        }
      }
    });

    return bestJobId;
  }

  static FindNewJob(
    executer: string,
    jobTypes: JobTypes[],
    roomNames: string[]
  ): { id: string; cache: JobCache } | undefined {
    let jobs = JobData.GetAllBasedOnCache(
      executer,
      true,
      roomNames,
      Predicates.IsJobTypes(jobTypes)
    );
    let jobId = this.FindBestJob(Object.keys(jobs));
    if (jobId !== undefined) {
      return { id: jobId, cache: jobs[jobId].cache as JobCache };
    }

    jobs = JobData.GetAllBasedOnCache(
      "",
      false,
      roomNames,
      Predicates.IsJobTypes(jobTypes)
    );
    jobId = this.FindBestJob(Object.keys(jobs));
    if (jobId !== undefined) {
      return { id: jobId, cache: jobs[jobId].cache as JobCache };
    }
    return undefined;
  }

  static GetJobTypesToExecute(creep: Creep, creepType: CreepTypes): JobTypes[] {
    if (creep.store.getUsedCapacity() > 0) {
      switch (creepType) {
        case "miner": {
          return ["TransferStructure"];
        }
        case "worker":
          return ["Build", "UpgradeController", "Repair"];
        case "transferer":
          return ["TransferStructure", "TransferSpawn"];
        // skip default case
      }
    } else {
      switch (creepType) {
        case "miner":
          return ["HarvestMineral", "HarvestSource"];
        case "worker":
        case "transferer":
          return ["TransferStructure"];
        case "claimer":
          return ["ReserveController"];
        // skip default case
      }
    }
    return [];
  }

  static FindJobForCreep(creep: Creep): boolean {
    const memoryResult = CreepData.GetMemory(creep.id);
    if (!memoryResult.success) {
      return false;
    }
    const creepMemory = memoryResult.memory as CreepMemory;
    const creepCache = memoryResult.cache as CreepCache;

    let roomNames = [creep.room.name];
    if (creepMemory.isRemoteCreep) {
      const roomMemory = RoomData.GetMemory(creep.room.name)
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
      const permJobData = JobData.GetMemory(creepMemory.permJobId);
      if (permJobData.success) {
        const permJobCache = permJobData.cache as JobCache;
        if (jobTypes.includes(permJobCache.type)) {
          return this.AssignCreepJob(
            creep.id,
            creepMemory,
            creepCache,
            creepMemory.permJobId,
            permJobCache
          );
        }
      }
    }
    const newJob = this.FindNewJob(creepCache.executer, jobTypes, roomNames);
    if (newJob !== undefined) {
      return this.AssignCreepJob(
        creep.id,
        creepMemory,
        creepCache,
        newJob.id,
        newJob.cache
      );
    }
    return false;
  }

  static FindJobForStructure(structure: Structure): boolean {
    return false;
  }

  static FindResourceJob(
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

  static UpdateAllData(room: Room): void {
    const jobIds = Object.keys(
      JobData.GetAllBasedOnCache("", false, [room.name])
    );
    forEach(jobIds, (id) => {
      this.UpdateData(room, id);
    });
  }

  static UpdateData(room: Room, id: string): boolean {
    const job = JobData.GetMemory(id);
    if (!job.success) {
      return false;
    }
    const jobMemory = job.memory as JobMemory;
    const jobCache = job.cache as JobCache;
    let updatedMemory = false;

    switch (jobCache.type) {
      case "Build":
        {
          const csSite = Game.getObjectById<ConstructionSite | null>(
            jobMemory.targetId
          );
          if (!csSite || (jobMemory.amountToTransfer ?? 0) <= 0) {
            const csSiteAtLocation = RoomConstruction.GetCsSiteAtLocation(
              room,
              jobMemory.pos
            );
            if (csSiteAtLocation) {
              jobMemory.targetId = csSiteAtLocation.id;
              updatedMemory = true;
            } else {
              const structureAtLocation = RoomHelper.GetStructureAtLocation(
                room,
                jobMemory.pos,
                jobMemory.structureType as StructureConstant
              );
              if (structureAtLocation) {
                StructureData.Initialize({
                  executer: jobCache.executer,
                  structure: structureAtLocation,
                });
              }
              this.Delete(id);
            }
          } else {
            jobMemory.amountToTransfer = csSite.progressTotal - csSite.progress;
            updatedMemory = true;
          }
        }
        break;
      case "HarvestMineral":
        {
          const mineral = Game.getObjectById<Mineral | null>(
            jobMemory.targetId
          );
          if (!mineral || (jobMemory.amountToTransfer ?? 0) <= 0) {
            this.Delete(id);
          } else {
            jobMemory.amountToTransfer = mineral.mineralAmount;
            updatedMemory = true;
          }
        }
        break;
      case "HarvestSource":
        updatedMemory = false;
        break;
      // case "ReserveController": {
      // }
      // break;
      case "TransferSpawn":
      case "TransferStructure":
      case "WithdrawStructure":
      case "WithdrawResource":
        {
          const target = Game.getObjectById<Structure | null>(
            jobMemory.targetId
          );
          if (!target || (jobMemory.amountToTransfer ?? 0) <= 0) {
            this.Delete(id);
          }
        }
        break;
      case "UpgradeController":
        {
          const controller = Game.getObjectById<StructureController | null>(
            jobMemory.targetId
          );
          if (!controller || (jobMemory.amountToTransfer ?? 0) <= 10 * 1000) {
            this.Delete(id);
          }
        }
        break;
      // skip default case
    }

    if (updatedMemory) {
      JobData.UpdateMemory(id, jobMemory, jobCache);
      return true;
    }
    return false;
  }

  static Delete(id: string): boolean {
    const creepsData = CreepData.GetAllBasedOnMemory(
      MemoryPredicates.HasJobId(id)
    );
    forOwn(
      creepsData,
      (data: DoubleCRUDResult<CreepMemory, CreepCache>, creepId: string) => {
        this.UnassignCreepJob(creepId, data.memory as CreepMemory, false);
      }
    );

    return JobData.DeleteMemory(id, true, true).success;
  }
}
