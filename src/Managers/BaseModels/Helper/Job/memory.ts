import { forEach } from "lodash";
import JobMemoryData from "../../Memory/job";
import JobCacheData from "../../Cache/job";

export default class JobDataHelper {
  static GetJobId(type: JobTypes, pos: FreezedRoomPosition): string {
    return `${type}_${pos.x}_${pos.y}_${pos.roomName}`;
  }

  static GetMemory(id: string): DoubleCRUDResult<JobMemory, JobCache> {
    const result: DoubleCRUDResult<JobMemory, JobCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = JobMemoryData.Get(id);
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = JobCacheData.Get(id);
    if (cacheResult.success && result.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }

  static CreateMemory(
    id: string,
    memory: JobMemory,
    cache: JobCache
  ): DoubleCRUDResult<JobMemory, JobCache> {
    const result: DoubleCRUDResult<JobMemory, JobCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryResult = JobMemoryData.Create(id, memory);
    if (memoryResult.success) {
      result.memory = memoryResult.data;
      result.success = true;
    }

    const cacheResult = JobCacheData.Create(id, cache);
    if (cacheResult.success && result.success) {
      result.cache = cacheResult.data;
      result.success = true;
    }

    return result;
  }

  static DeleteMemory(
    id: string,
    isMemory: boolean,
    isCache: boolean
  ): DoubleCRUDResult<JobMemory, JobCache> {
    const result: DoubleCRUDResult<JobMemory, JobCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    if (isMemory) {
      const deleteResult = JobMemoryData.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.memory = deleteResult.data;
      }
    }
    if (isCache && result.success) {
      const deleteResult = JobCacheData.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.cache = deleteResult.data;
      }
    }
    return result;
  }

  static DeleteAllData(roomName: string): void {
    const jobIds = Object.keys(JobCacheData.GetAll("", false, [roomName]));

    forEach(jobIds, (id) => {
      this.DeleteMemory(id, true, true);
    });
  }

  static UpdateMemory(
    id: string,
    memory?: JobMemory,
    cache?: JobCache
  ): DoubleCRUDResult<JobMemory, JobCache> {
    const result: DoubleCRUDResult<JobMemory, JobCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    if (memory) {
      const updateResult = JobMemoryData.Update(id, memory);
      if (updateResult.success) {
        result.success = true;
        result.memory = updateResult.data;
      }
    }
    if (cache && result.success) {
      const updateResult = JobCacheData.Update(id, cache);
      if (updateResult.success) {
        result.success = true;
        result.cache = updateResult.data;
      }
    }

    return result;
  }

  static Initialize(
    data: JobInitializationData
  ): DoubleCRUDResult<JobMemory, JobCache> {
    const id = this.GetJobId(data.type, data.pos);
    const result: DoubleCRUDResult<JobMemory, JobCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = JobMemoryData.Initialize(
      id,
      data.targetId,
      data.pos,
      data.objectType,
      data.amountToTransfer,
      data.fromTargetId,
      data.structureType,
      data.maxCreepsCount
    );
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = JobCacheData.Initialize(id, data.executer, data.type);
    if (cacheResult.success && result.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }

  private static GetAll(
    isMemory: boolean,
    getOnlyFreeJobs?: boolean,
    executer?: string,
    getOnlyExecuterJobs?: boolean,
    roomsToCheck?: string[],
    predicateMemory?: Predicate<JobMemory>,
    predicateCache?: Predicate<JobCache>
  ): StringMap<DoubleCRUDResult<JobMemory, JobCache>> {
    const result: StringMap<DoubleCRUDResult<JobMemory, JobCache>> = {};
    const ids = Object.keys(
      isMemory
        ? JobMemoryData.GetAll(getOnlyFreeJobs, predicateMemory)
        : JobCacheData.GetAll(
            executer,
            getOnlyExecuterJobs,
            roomsToCheck,
            predicateCache
          )
    );
    forEach(ids, (id) => {
      const memoryResult = JobMemoryData.Get(id);
      const cacheResult = JobCacheData.Get(id);
      if (memoryResult.success && cacheResult.success) {
        result[id] = {
          success: true,
          memory: memoryResult.data,
          cache: cacheResult.data,
        };
      }
    });

    return result;
  }

  static GetAllBasedOnMemory(
    getOnlyFreeJobs = false,
    predicate?: Predicate<JobMemory>
  ): StringMap<DoubleCRUDResult<JobMemory, JobCache>> {
    return this.GetAll(
      true,
      getOnlyFreeJobs,
      undefined,
      undefined,
      undefined,
      predicate
    );
  }

  static GetAllBasedOnCache(
    executer = "",
    getOnlyExecuterJobs = false,
    roomsToCheck?: string[],
    predicate?: Predicate<JobCache>
  ): StringMap<DoubleCRUDResult<JobMemory, JobCache>> {
    return this.GetAll(
      false,
      undefined,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      undefined,
      predicate
    );
  }
}
