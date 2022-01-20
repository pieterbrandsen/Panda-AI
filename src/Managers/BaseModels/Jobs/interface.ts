import { forEach } from "lodash";
import IJobMemory from "../Memory/jobInterface";
import ICreepMemory from "../Memory/creepInterface";
import ICreepCache from "../Cache/creepInterface";
import IJobCache from "../Cache/jobInterface";
import IRoomInterface from "../Helper/roomInterface";
import IRoomMemory from "../Memory/roomInterface";
import Predicates from "./predicates";

// TODO: Update (all/single)
// TODO: GenerateObject (update whenever something needs to be added, assign in this function the missing data that is optional?)
// *^ LATER

interface IJobs {}

export default class implements IJobs {
  static GetJobId(type: JobTypes, pos: FreezedRoomPosition): string {
    return `${type}_${pos.x}_${pos.y}_${pos.roomName}`;
  }

  static Create(
    id: string,
    data: JobMemory,
    cache: JobCache
  ): CRUDResult<JobMemory> {
    // TODO: Check return later and revert if failed later
    IJobCache.Create(id, cache);
    return IJobMemory.Create(id, data);
  }

  static Update(id: string, data: JobMemory): CRUDResult<JobMemory> {
    return IJobMemory.Update(id, data);
  }

  static Get(id: string): CRUDResult<JobMemory> {
    return IJobMemory.Get(id);
  }

  static Delete(id: string): CRUDResult<JobMemory> {
    return IJobMemory.Delete(id);
  }

  static MoveJob(
    id: string,
    type: "Room" | "Manager",
    value: string
  ): CRUDResult<JobCache> {
    const cacheJob = IJobCache.Get(id);
    if (!cacheJob.success) {
      return { success: false, data: undefined };
    }
    const job = cacheJob.data as JobCache;
    const room =
      type === "Room" ? value : IRoomInterface.GetRoom(job.executer).key;
    const manager =
      type === "Manager" ? value : IRoomInterface.GetManagerName(job.executer);
    job.executer = IRoomInterface.GetExecuter(room, manager as ManagerTypes);
    return IJobCache.Update(id, job);
  }

  static Generate(type: JobTypes, pos: FreezedRoomPosition): JobMemory {
    return new IJobMemory().Generate(type, pos);
  }

  static Initialize(data: JobInitializationData): string | undefined {
    const id = this.GetJobId(data.type, data.pos);
    const existingJob = IJobMemory.Get(id);
    if (existingJob.success) return undefined;
    const job = new IJobMemory().GenerateObject(data);
    const cache = IJobCache.Generate(data);
    this.Create(id, job, cache);
    return id;
  }

  static FindNewJob(
    executer: string,
    creepType: CreepTypes,
    roomNames: string[]
  ): { id: string; job: JobCache } | undefined {
    let jobs = IJobCache.GetAll(
      true,
      executer,
      roomNames,
      Predicates.IsCreepType(creepType)
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
      Predicates.IsCreepType(creepType)
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

  static FindJobForCreep(creep: Creep, creepMemory: CreepMemory): boolean {
    const creepCacheResult = ICreepCache.Get(creep.name);
    if (!creepCacheResult.success) {
      return false;
    }
    const creepCache = creepCacheResult.data as CreepCache;
    let roomNames = [creep.room.name];
    if (creepMemory.isRemoteCreep) {
      const roomMemory = IRoomMemory.Get(creep.room.name).data as RoomMemory;
      roomNames = Object.keys(roomMemory.remoteRooms);
    }

    const newJob = this.FindNewJob(
      creepCache.executer,
      creepCache.type,
      roomNames
    );
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
      ICreepMemory.Update(creep.name, creepMemory);
      ICreepCache.Update(creep.name, creepCache);
      return true;
    }
    return false;
  }
}
