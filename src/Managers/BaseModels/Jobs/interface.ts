import { forEach } from "lodash";
import IJobMemory from "../Memory/jobInterface";
import ICreepMemory from "../Helper/creepMemory";
import IJobCache from "../Cache/jobInterface";
import IJobHelper from "../Helper/jobMemory";
import IRoomInterface from "../Helper/roomInterface";
import IRoomMemory from "../Memory/roomInterface";
import Predicates from "./predicates";
import IStructureMemory from "../Memory/structureInterface";
import IResourceStorage from "../ResourceStorage/interface";

// TODO: Update (all/single)
// TODO: GenerateObject (update whenever something needs to be added, assign in this function the missing data that is optional?)
// *^ LATER

interface IJobs {}

export default class implements IJobs {
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
      type === "Room" ? newExecuter : IRoomInterface.GetRoom(job.executer).key;
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
    roomNames: string[]
  ): { id: string; job: JobCache } | undefined {
    let jobs = IJobCache.GetAll(
      true,
      executer,
      roomNames,
      Predicates.IsJobTypes(jobTypes)
    );
    if (!jobs.success) {
      return undefined;
    }

    let jobId: string | undefined;
    let lastAssigned = Infinity;
    let jobIds = Object.keys(jobs);
    forEach(jobIds, (id) => {
      const jobMemoryResult = IJobMemory.Get(id);
      if (jobMemoryResult.success) {
        const jobMemory = jobMemoryResult.data as JobMemory;
        if (jobMemory.lastAssigned < lastAssigned) {
          jobId = id;
          lastAssigned = jobMemory.lastAssigned;
        }
      }
    });

    if (jobId !== undefined) {
      return { id: jobId, job: jobs[jobId] };
    }

    lastAssigned = Infinity;
    jobs = IJobCache.GetAll(
      false,
      executer,
      roomNames,
      Predicates.IsJobTypes(jobTypes)
    );
    jobIds = Object.keys(jobs);
    forEach(jobIds, (id) => {
      const jobMemoryResult = IJobMemory.Get(id);
      if (jobMemoryResult.success) {
        const jobMemory = jobMemoryResult.data as JobMemory;
        if (jobMemory.lastAssigned < lastAssigned) {
          jobId = id;
          lastAssigned = jobMemory.lastAssigned;
        }
      }
    });

    if (jobId !== undefined) {
      return { id: jobId, job: jobs[jobId] };
    }
    return undefined;
  }

  static GetJobTypesToExecute(
    creep: Creep,
    creepType: CreepTypes,
    executer: string
  ): JobTypes[] {
    if (creep.store.getUsedCapacity() > 0) {
      switch (creepType) {
        case "miner":
          new IResourceStorage(creep, "creep", executer).Manage(false, true);
          break;
        case "worker":
          return ["Build", "UpgradeController"];
        case "transferer":
          return ["TransferSpawn", "TransferStructure"];
        // skip default case
      }
    } else {
      switch (creepType) {
        case "miner":
          return ["HarvestMineral", "HarvestSource"];
        case "worker":
        case "transferer":
          break;
        // skip default case
      }
    }

    new IResourceStorage(creep, "creep", executer).Manage(true, false);
    return [];
  }

  static FindJobForCreep(creep: Creep): boolean {
    const creepId = ICreepMemory.GetCreepId(creep.name);
    const memoryResult = ICreepMemory.GetMemory(creepId);
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
      creepCache.executer
    );
    const newJob = this.FindNewJob(creepCache.executer, jobTypes, roomNames);
    if (newJob !== undefined) {
      creepMemory.jobId = newJob.id;
      creepCache.executer = newJob.job.executer;
      const jobMemory = IJobMemory.Get(newJob.id);
      if (!jobMemory.success) {
        return false;
      }
      const job = jobMemory.data as JobMemory;
      job.lastAssigned = Game.time;
      IJobMemory.Update(newJob.id, job);

      ICreepMemory.UpdateMemory(creepId, creepMemory, creepCache);
      return true;
    }
    return false;
  }

  static UpdateAllData(room: Room): void {
    const jobIds = Object.keys(
      IJobCache.GetAll(false, "", [room.name]).data ?? {}
    );
    forEach(jobIds, (id) => {
      this.UpdateData(room, id);
    });
  }

  static UpdateData(room: Room, id: string): boolean {
    const job = IJobHelper.GetMemory(id);
    if (!job.success) {
      return false;
    }
    if (job.memory && job.cache) {
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
            const csSiteAtLocation = IRoomInterface.GetCsSiteAtLocation(
              room,
              jobMemory.pos
            );
            if (csSiteAtLocation) {
              jobMemory.targetId = csSiteAtLocation.id;
            } else {
              IJobHelper.DeleteMemory(id, true, true);
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
            IJobHelper.DeleteMemory(id, true, true);
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
        {
          const structure = Game.getObjectById<Structure | null>(
            jobMemory.targetId
          );
          const targetStructure = Game.getObjectById<Structure | null>(
            jobMemory.fromTargetId as ""
          );
          if (
            !structure ||
            !targetStructure ||
            (jobMemory.amountToTransfer ?? 0) <= 0
          ) {
            IJobHelper.DeleteMemory(id, true, true);
            const structureMemory = IStructureMemory.Get(jobMemory.targetId);
            const targetStructureMemory = IStructureMemory.Get(
              jobMemory.fromTargetId ?? ""
            );
            if (structureMemory.data) {
              delete structureMemory.data.energyIncoming[id];
              delete structureMemory.data.energyOutgoing[id];
            }
            if (targetStructureMemory.data) {
              delete targetStructureMemory.data.energyIncoming[id];
              delete targetStructureMemory.data.energyOutgoing[id];
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
            IJobHelper.DeleteMemory(id, true, true);
          }
        }
        break;
      // skip default case
    }

    if (updatedMemory) {
      IJobHelper.UpdateMemory(id, jobMemory, jobCache);
      return true;
    }
    return false;
  }
}
