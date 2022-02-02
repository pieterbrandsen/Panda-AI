import { forEach, forOwn } from "lodash";
import IJobMemory from "../Memory/jobInterface";
import ICreepData from "../Helper/Creep/creepMemory";
import ICreepMemory from "../Memory/creepInterface";
import IJobCache from "../Cache/jobInterface";
import IJobData from "../Helper/Job/jobMemory";
import IRoomInterface from "../Helper/Room/roomInterface";
import IRoomMemory from "../Memory/roomInterface";
import Predicates from "./predicates";
import MemoryPredicates from "../Memory/predicates";
import IStructureMemory from "../Memory/structureInterface";
import IResourceStorage from "../ResourceStorage/interface";
import IStructureData from "../Helper/Structure/structureMemory";
import IRoomConstruction from "../Helper/Room/roomConstruction";

// TODO: Update (all/single)
// TODO: GenerateObject (update whenever something needs to be added, assign in this function the missing data that is optional?)
// *^ LATER

interface IJobs {}

export default class implements IJobs {
  static UnassignCreepJob(creepId: string, memory: CreepMemory,saveJob:boolean): boolean {
    if (memory.jobId) {
      const jobData = IJobMemory.Get(memory.jobId);
      if (jobData.success) {
        const job = jobData.data as JobMemory;
        const index = job.assignedCreeps.indexOf(creepId);
        if (index !== -1) {
          job.assignedCreeps.splice(index, 1);
        }
        if (job.fromTargetId) delete job.fromTargetId; 
        IJobMemory.Update(memory.jobId, job);
        
        const targetData = IStructureData.GetMemory(job.targetId);
        if (targetData.success) {
          const targetMemory = targetData.memory as StructureMemory;
          const updatedMemory = false;
          if (targetMemory.energyIncoming[job.fromTargetId ?? ""]) {
            delete targetMemory.energyIncoming[job.fromTargetId ?? ""];
          }
          if (targetMemory.energyOutgoing[job.fromTargetId ?? ""]) {
            delete targetMemory.energyOutgoing[job.fromTargetId ?? ""];
          }
          if (updatedMemory)
            IStructureData.UpdateMemory(job.targetId, targetMemory);
        }
      }
    }
    if (saveJob) {
      memory.permJobId = memory.jobId;
    }
    delete memory.jobId;

    return ICreepData.UpdateMemory(creepId, memory).success;
  }

  static AssignCreepJob(creepId:string,creepMemory:CreepMemory,creepCache:CreepCache,jobId:string,jobCache:JobCache):boolean {
    if (jobId === creepMemory.permJobId) {
      delete creepMemory.permJobId;
    }
    creepMemory.jobId = jobId;
    creepCache.executer = jobCache.executer;
    const jobMemory = IJobMemory.Get(jobId);
    if (!jobMemory.success) {
      return false;
    }
    const job = jobMemory.data as JobMemory;
    job.assignedCreeps.push(creepId);
    job.lastAssigned = Game.time;
    if (!IJobMemory.Update(jobId, job).success) return false;
    return ICreepData.UpdateMemory(creepId, creepMemory, creepCache).success;
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
      type === "Room" ? newExecuter : IRoomInterface.GetRoomName(job.executer);
    const manager =
      type === "Manager"
        ? newExecuter
        : IRoomInterface.GetManagerName(job.executer);
    job.executer = IRoomInterface.GetExecuter(room, manager as ManagerTypes);
    return IJobCache.Update(id, job);
  }

  static FindNewJob(
    executer: string,
    jobTypes: JobTypes[],
    roomNames: string[],
  ): { id: string; cache: JobCache } | undefined {
    let jobs = IJobCache.GetAll(
      true,
      executer,
      roomNames,
      Predicates.IsJobTypes(jobTypes)
    );
    let jobId: string | undefined;
    let lastAssigned = Infinity;
    let jobIds = Object.keys(jobs);
    forEach(jobIds, (id) => {
      const jobMemoryResult = IJobMemory.Get(id);
      if (jobMemoryResult.success) {
        const jobMemory = jobMemoryResult.data as JobMemory;
        if (jobMemory.lastAssigned < lastAssigned && jobMemory.assignedCreeps.length < (jobMemory.maxCreepsCount ?? 99)) {
          jobId = id;
          lastAssigned = jobMemory.lastAssigned;
        }
      }
    });

    if (jobId !== undefined) {
      return { id: jobId, cache: jobs[jobId] };
    }

    jobs = IJobCache.GetAll(
      false,
      "",
      roomNames,
      Predicates.IsJobTypes(jobTypes)
    );
    jobIds = Object.keys(jobs);
    forEach(jobIds, (id) => {
      const jobMemoryResult = IJobMemory.Get(id);
      if (jobMemoryResult.success) {
        const jobMemory = jobMemoryResult.data as JobMemory;
        if (jobMemory.lastAssigned < lastAssigned && jobMemory.assignedCreeps.length < (jobMemory.maxCreepsCount ?? 99)) {
          jobId = id;
          lastAssigned = jobMemory.lastAssigned;
        }
      }
    });

    if (jobId !== undefined) {
      return { id: jobId, cache: jobs[jobId] };
    }
    return undefined;
  }

  static GetJobTypesToExecute(
    creep: Creep,
    creepType: CreepTypes,
    executer: string,
  ): JobTypes[] {
    if (creep.store.getUsedCapacity() > 0) {
      switch (creepType) {
        case "worker":
          return ["Build", "UpgradeController", "Repair"];
        case "transferer":
          new IResourceStorage(creep, "Creep", executer).Manage(false, true);
        // skip default case
      }
    } else {
      switch (creepType) {
        case "miner":
          return ["HarvestMineral", "HarvestSource"];
        case "worker":
        case "transferer":
          {
            const resourceStorage = new IResourceStorage(
              creep,
              "Creep",
              executer
            );
            if (!resourceStorage.Manage(true, false)) {
              resourceStorage.ManageDroppedResource();
            }
          }
          break;
        case "claimer":
          return ["ReserveController"];
        // skip default case
      }
    }

    return [];
  }

  static FindJobForCreep(creep: Creep): boolean {
    const creepId = ICreepData.GetCreepId(creep.name);
    const memoryResult = ICreepData.GetMemory(creepId);
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

    const jobTypes = this.GetJobTypesToExecute(
      creep,
      creepCache.type,
      creepCache.executer, 
    );

    if (creepMemory.permJobId) {
      const permJobData = IJobData.GetMemory(creepMemory.permJobId);
      if (permJobData.success) {
        const permJobCache = permJobData.cache as JobCache;
        if (jobTypes.includes(permJobCache.type)) {
          this.AssignCreepJob(creepId,creepMemory,creepCache,creepMemory.permJobId,permJobCache);
        }
      }
    }
    const newJob = this.FindNewJob(creepCache.executer, jobTypes, roomNames);
    if (newJob !== undefined) {
      return this.AssignCreepJob(creepId,creepMemory,creepCache,newJob.id,newJob.cache);
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
            } else {
              const structureAtLocation = IRoomInterface.GetStructuresAtLocation(
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
          const fromTarget = Game.getObjectById<Structure | Creep | null>(
            jobMemory.fromTargetId as ""
          );
          if (
            !target ||
            !fromTarget ||
            (jobMemory.amountToTransfer ?? 0) <= 0
          ) {
            this.Delete(id);
            const targetStructureMemory = IStructureMemory.Get(
              jobMemory.targetId
            );
            const fromTargetStructureMemory = IStructureMemory.Get(
              jobMemory.fromTargetId ?? ""
            );
            if (fromTargetStructureMemory.data) {
              delete fromTargetStructureMemory.data.energyIncoming[
                jobMemory.targetId
              ];
              delete fromTargetStructureMemory.data.energyOutgoing[
                jobMemory.targetId
              ];
            }
            if (targetStructureMemory.data && jobMemory.fromTargetId) {
              delete targetStructureMemory.data.energyIncoming[
                jobMemory.fromTargetId
              ];
              delete targetStructureMemory.data.energyOutgoing[
                jobMemory.fromTargetId
              ];
            }
          }
        }
        break;
      case "UpgradeController":
        {
          const controller = Game.getObjectById<StructureController | null>(
            jobMemory.targetId
          );
          if (!controller || (jobMemory.amountToTransfer ?? 0) <= 0) {
            this.Delete(id);
          } else if (
            jobMemory.amountToTransfer &&
            jobMemory.amountToTransfer < 1000
          ) {
            jobMemory.amountToTransfer = 20 * 1000;
            updatedMemory = true;
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
      this.UnassignCreepJob(creepId, memory,false);
    });

    return IJobData.DeleteMemory(id, true, true).success;
  }
}
