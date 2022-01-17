import IJobMemory from "../Memory/jobInterface";
import ICreepMemory from "../Memory/creepInterface";
import ICreepCache from "../Cache/creepInterface";
import IJobCache from "../Cache/jobInterface";
import IRoomInterface from "../Helper/roomInterface";
import Predicates from "./predicates";
import { forEach } from "lodash";

// TODO: Update (all/single)
// TODO: GenerateObject (update whenever something needs to be added, assign in this function the missing data that is optional?)
// *^ LATER

interface IJobs {}

export default class implements IJobs {
  static GetJobId(type: JobTypes, pos: FreezedRoomPosition): string {
    return `${type}_${pos.x}_${pos.y}_${pos.roomName}`;
  }
  static Create(id: string, data: JobMemory): CRUDResult<JobMemory> {
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
  static Generate(type, pos: FreezedRoomPosition): JobMemory {
    return new IJobMemory().Generate(type, pos);
  }
  static Initialize(type: JobTypes, pos: FreezedRoomPosition): void {
    const job = new IJobMemory().Generate(type, pos);
    this.Create(this.GetJobId(type, pos), job);
  }
  static FindNewJob(
    executer: string,
    creepType:CreepTypes
  ): {id:string,job:JobCache} | undefined {
    // get for creep type
    let jobs = IJobCache.GetAll(true, executer,Predicates.IsCreepType(creepType));
    if (!jobs.success) {
      return undefined;
    }

    let jobId: string | undefined;
    let lastAssigned: number = Infinity;
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
      return {id:jobId,job:jobs[jobId]};
    }

    lastAssigned = Infinity;
    jobs = IJobCache.GetAll(false, executer,Predicates.IsCreepType(creepType));
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
      return {id:jobId,job:jobs[jobId]};
    }
    return undefined;
  }

  static FindJobForCreep(creep:Creep, creepMemory:CreepMemory):boolean {
      const creepCacheResult = ICreepCache.Get(creep.name);
      if (!creepCacheResult.success) {
          return false;
      }
      const creepCache = creepCacheResult.data as CreepCache;

    const newJob = this.FindNewJob(creepCache.executer, creep.memory.type);
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
    else return false;
  }
}