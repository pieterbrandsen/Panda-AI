import { forEach, forOwn, remove } from "lodash";
import IJobMemory from "../Memory/jobInterface";
import ICreepData from "../Helper/Creep/creepMemory";
import ICreepMemory from "../Memory/creepInterface";
import IJobCache from "../Cache/jobInterface";
import IJobData from "../Helper/Job/jobMemory";
import IRoomMemory from "../Memory/roomInterface";
import Predicates from "./predicates";
import MemoryPredicates from "../Memory/predicates";
import IStructureMemory from "../Memory/structureInterface";
import IResourceStorage from "../ResourceStorage/interface";
import IStructureData from "../Helper/Structure/structureMemory";
import IDroppedResourceData from "../Helper/DroppedResource/droppedResourceMemory";
import IRoomConstruction from "../Helper/Room/roomConstruction";
import IRoomHelper from "../Helper/Room/roomInterface";
import IJobHelper from "../Helper/Job/helper";
import IRoomHeap from "../Heap/roomInterface";

// TODO: Update (all/single)
// TODO: GenerateObject (update whenever something needs to be added, assign in this function the missing data that is optional?)
// *^ LATER

interface IJobs {}

export default class implements IJobs {
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
      const jobData = IJobMemory.Get(memory.jobId);
      if (jobData.success) {
        const job = jobData.data as JobMemory;
        const targetStructureData = IStructureData.GetMemory(job.targetId);
        if (targetStructureData.success) {
          const targetMemory = targetStructureData.memory as StructureMemory;
        if (targetMemory && job.fromTargetId) {
          delete targetMemory.energyOutgoing[job.fromTargetId];
          delete targetMemory.energyIncoming[job.fromTargetId];

          IStructureMemory.Update(job.targetId, memory);
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
    return IStructureData.UpdateMemory(structureId, memory).success;
  }

  static UnassignCreepJob(
    creepId: string,
    memory: CreepMemory,
    saveJob: boolean
  ): boolean {
    if (memory && memory.jobId) {
      const jobData = IJobMemory.Get(memory.jobId);
      if (jobData.success) {
        const job = jobData.data as JobMemory;
        this.RemoveAssignedCreepOutOfArray(job.assignedCreeps, creepId);

        let type: JobObjectExecuter = "Structure";
        let targetMemory: StructureMemory | DroppedResourceMemory | null = null;
        const targetStructureData = IStructureData.GetMemory(job.targetId);
        if (targetStructureData.success) {
          targetMemory = targetStructureData.memory as StructureMemory;
          type = "Structure";
        } else {
          const targetDroppedResourceData = IDroppedResourceData.GetMemory(
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
            IStructureMemory.Update(job.targetId, memory);
          } else {
            IDroppedResourceData.UpdateMemory(job.targetId, memory);
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

    return ICreepData.UpdateMemory(creepId, memory).success;
  }

  static AssignCreepJob(
    creepId: string,
    creepMemory: CreepMemory,
    creepCache: CreepCache,
    jobId: string,
    jobCache: JobCache
  ): boolean {
    const jobMemory = IJobMemory.Get(jobId);
    if (!jobMemory.success) {
      return false;
    }
    const job = jobMemory.data as JobMemory;
    if (jobId === creepMemory.permJobId) {
      delete creepMemory.permJobId;
    }
    if (!job.assignedCreeps.includes(creepId)) job.assignedCreeps.push(creepId);
    creepMemory.jobId = jobId;
    creepCache.executer = jobCache.executer;
    job.fromTargetId = creepId;
    job.lastAssigned = Game.time;
    if (!IJobMemory.Update(jobId, job).success) {
      return false;
    }
    return ICreepData.UpdateMemory(creepId, creepMemory, creepCache).success;
  }

  static UpdateAmount(
    jobId: string,
    memory: JobMemory,
    cache: JobCache,
    amount: number, 
    sendStats: boolean = false
  ): boolean {
    if (memory.amountToTransfer) {
      memory.amountToTransfer -= amount;
    }

    if (!sendStats) return IJobData.UpdateMemory(jobId, memory).success;

    const roomName = IRoomHelper.GetRoomName(cache.executer);
    const globalRoomData = IRoomHeap.Get(roomName);
    if (globalRoomData.success) {
      const globalRoom = globalRoomData.data as RoomHeap;
      const jobStatsType = IJobHelper.GetJobStatsType(cache.type);
      if (jobStatsType === "Incoming") {
        globalRoom.stats.energyIncoming[cache.type] += amount;
      } else if (jobStatsType === "Outgoing") {
        let amountExpense = amount;
        if (cache.type === "Repair") amountExpense /= 100;
        else if (cache.type === "Build") amountExpense /= 5;
        globalRoom.stats.energyOutgoing[cache.type] += amountExpense;
      }
    }
    return IJobData.UpdateMemory(jobId, memory).success;
  }

  static MoveJob(
    id: string,
    type: "Room" | "Manager",
    newExecuter: string
  ): CRUDResult<JobCache> {
    const cacheJob = IJobCache.Get(id);
    if (!cacheJob.success) {
      return { success: false, data: undefined };
    }
    const job = cacheJob.data as JobCache;
    const room =
      type === "Room" ? newExecuter : IRoomHelper.GetRoomName(job.executer);
    const manager =
      type === "Manager"
        ? newExecuter
        : IRoomHelper.GetManagerName(job.executer);
    job.executer = IRoomHelper.GetExecuter(room, manager as ManagerTypes);
    return IJobCache.Update(id, job);
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
      const jobMemoryResult = IJobMemory.Get(jobId);
      if (jobMemoryResult.success) {
        const jobMemory = jobMemoryResult.data as JobMemory;
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
    let jobs = IJobCache.GetAll(
      true,
      executer,
      roomNames,
      Predicates.IsJobTypes(jobTypes)
    );
    let jobId = this.FindBestJob(Object.keys(jobs));
    if (jobId !== undefined) {
      return { id: jobId, cache: jobs[jobId] };
    }

    jobs = IJobCache.GetAll(
      false,
      "",
      roomNames,
      Predicates.IsJobTypes(jobTypes)
    );
    jobId = this.FindBestJob(Object.keys(jobs));
    if (jobId !== undefined) {
      return { id: jobId, cache: jobs[jobId] };
    }
    return undefined;
  }

  static GetJobTypesToExecute(
    creep: Creep,
    creepType: CreepTypes,
    executer: string
  ): JobTypes[] | string | undefined {
    if (creep.store.getUsedCapacity() > 0) {
      switch (creepType) {
        case "worker":
          return ["Build", "UpgradeController", "Repair"];
        case "transferer":
          return new IResourceStorage(creep, "Creep", executer).Manage(
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
          return new IResourceStorage(creep, "Creep", executer).Manage(
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
    const memoryResult = ICreepData.GetMemory(creep.id);
    if (!memoryResult.success) {
      return false;
    }
    const creepMemory = memoryResult.memory as CreepMemory;
    const creepCache = memoryResult.cache as CreepCache;

    let roomNames = [creep.room.name];
    if (creepMemory.isRemoteCreep) {
      const roomMemory = IRoomMemory.Get(creep.room.name).data as RoomMemory;
      roomNames = Object.keys(roomMemory.remoteRooms ?? {});
    }

    const jobTypesOrJobId = this.GetJobTypesToExecute(
      creep,
      creepCache.type,
      creepCache.executer
    );
    if (jobTypesOrJobId === undefined) {
      return false;
    }

    let jobTypes: JobTypes[] = [];
    if (Array.isArray(jobTypesOrJobId)) {
      jobTypes = jobTypesOrJobId;
    } else {
      const jobId = jobTypesOrJobId as string;
      const jobData = IJobData.GetMemory(jobId);
      if (!jobData.success) {
        return false;
      }
      return this.AssignCreepJob(
        creep.id,
        creepMemory,
        creepCache,
        jobId,
        jobData.cache as JobCache
      );
    }

    if (creepMemory.permJobId) {
      const permJobData = IJobData.GetMemory(creepMemory.permJobId);
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
    const jobIds = Object.keys(IJobCache.GetAll(false, "", [room.name]));
    forEach(jobIds, (id) => {
      this.UpdateData(room, id);
    });
  }

  static UpdateData(room: Room, id: string): boolean {
    const job = IJobData.GetMemory(id);
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
            const csSiteAtLocation = IRoomConstruction.GetCsSiteAtLocation(
              room,
              jobMemory.pos
            );
            if (csSiteAtLocation) {
              jobMemory.targetId = csSiteAtLocation.id;
              updatedMemory = true;
            } else {
              const structureAtLocation = IRoomHelper.GetStructureAtLocation(
                room,
                jobMemory.pos,
                jobMemory.structureType as StructureConstant
              );
              if (structureAtLocation) {
                IStructureData.Initialize({
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
          if (!controller || (jobMemory.amountToTransfer ?? 0) <= 5 * 1000) {
            this.Delete(id);
          }
        }
        break;
      // skip default case
    }

    if (updatedMemory) {
      IJobData.UpdateMemory(id, jobMemory, jobCache);
      return true;
    }
    return false;
  }

  public static Delete(id: string): boolean {
    const creeps = ICreepMemory.GetAll(MemoryPredicates.HasJobId(id));
    forOwn(creeps, (memory: CreepMemory, creepId: string) => {
      this.UnassignCreepJob(creepId, memory, false);
    });

    return IJobData.DeleteMemory(id, true, true).success;
  }
}

// Game.market.createOrder({
//   type: ORDER_BUY,
//   resourceType: PIXEL,
//   price: 7630,
//   totalAmount: 98400,
// });
