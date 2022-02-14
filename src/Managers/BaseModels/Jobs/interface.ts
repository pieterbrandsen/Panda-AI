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
          console.log(
            "Delete",
            memory.jobId,
            creepId,
            `${targetMemory.energyIncoming[job.fromTargetId]} - ${
              targetMemory.energyOutgoing[job.fromTargetId]
            }`
          );

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
    const jobMemory = JobData.GetMemory(jobId);
    if (!jobMemory.success) {
      return false;
    }
    const job = jobMemory.memory as JobMemory;
    if (jobId === creepMemory.permJobId) {
      delete creepMemory.permJobId;
    }
    if (!job.assignedCreeps.includes(creepId)) job.assignedCreeps.push(creepId);
    creepMemory.jobId = jobId;
    creepCache.executer = jobCache.executer;
    job.fromTargetId = creepId;
    job.lastAssigned = Game.time;
    if (!JobData.UpdateMemory(jobId, job).success) {
      return false;
    }
    if (
      jobCache.type.includes("Transfer") ||
      jobCache.type.includes("Withdraw")
    )
      console.log("Assign", jobId, creepId);
    return CreepData.UpdateMemory(creepId, creepMemory, creepCache).success;
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

  static GetJobTypesToExecute(
    creep: Creep,
    creepType: CreepTypes,
    executer: string,
    permJobId?: string
  ):
    | JobTypes[]
    | { jobId?: string; memory: CreepMemory | StructureMemory }
    | undefined
    | undefined {
    if (creep.store.getUsedCapacity() > 0) {
      switch (creepType) {
        case "miner": {
          const result = new ResourceStorage(creep, "Creep", executer).Manage(
            false,
            true,
            false,
            true,
            3
          );
          if (!result) {
            creep.drop(RESOURCE_ENERGY);
            return undefined;
          }
          return result;
        }
        case "worker":
          return ["Build", "UpgradeController", "Repair"];
        case "transferer":
          return new ResourceStorage(creep, "Creep", executer).Manage(
            false,
            true
          );
        // skip default case
      }
    } else {
      switch (creepType) {
        case "miner":
          return ["HarvestMineral", "HarvestSource"];
        case "worker":
        case "transferer":
          if (permJobId?.includes("Upgrade")) {
            return new ResourceStorage(creep, "Creep", executer).Manage(
              true,
              false,
              false,
              true,
              3
            );
          }
          return new ResourceStorage(creep, "Creep", executer).Manage(
            true,
            false
          );
        case "claimer":
          return ["ReserveController"];
        // skip default case
      }
    }
    return undefined;
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

    const jobTypesOrJobId = this.GetJobTypesToExecute(
      creep,
      creepCache.type,
      creepCache.executer,
      creepMemory.permJobId
    );
    if (jobTypesOrJobId === undefined) {
      return false;
    }

    let jobTypes: JobTypes[] = [];
    if (Array.isArray(jobTypesOrJobId)) {
      jobTypes = jobTypesOrJobId;
    } else {
      const newJobData = jobTypesOrJobId as
        | { jobId?: string; memory: CreepMemory | StructureMemory }
        | undefined;
      const jobId = newJobData ? (newJobData.jobId as string) : "";
      const jobData = JobData.GetMemory(jobId);
      if (!jobData.success) {
        return false;
      }
      return this.AssignCreepJob(
        creep.id,
        newJobData ? (newJobData.memory as CreepMemory) : creepMemory,
        creepCache,
        jobId,
        jobData.cache as JobCache
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

  public static Delete(id: string): boolean {
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

// Game.market.createOrder({
//   type: ORDER_BUY,
//   resourceType: PIXEL,
//   price: 7630,
//   totalAmount: 98400,
// });
