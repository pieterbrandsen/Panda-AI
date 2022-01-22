import IJobMemory from "../../Memory/jobInterface";
import IJobCache from "../../Cache/jobInterface";

interface IJobHelper {}

export default class implements IJobHelper {
  static GetJobId(type: JobTypes, pos: FreezedRoomPosition): string {
    return `${type}_${pos.x}_${pos.y}_${pos.roomName}`;
  }

  static GetMemory(id: string): DoubleCRUDResult<JobMemory, JobCache> {
    const result: DoubleCRUDResult<JobMemory, JobCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = IJobMemory.Get(id);
    if (result.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = IJobCache.Get(id);
    if (result.success) {
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

    const memoryResult = IJobMemory.Create(id, memory);
    if (memoryResult.success) {
      result.memory = memoryResult.data;
      result.success = true;
    }

    const cacheResult = IJobCache.Create(id, cache);
    if (cacheResult.success) {
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
      const deleteResult = IJobMemory.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.memory = deleteResult.data;
      }
    }
    if (isCache) {
      const deleteResult = IJobCache.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.cache = deleteResult.data;
      }
    }
    return result;
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
      const updateResult = IJobMemory.Update(id, memory);
      if (updateResult.success) {
        result.success = true;
        result.memory = updateResult.data;
      }
    }
    if (cache) {
      const updateResult = IJobCache.Update(id, cache);
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
    const memoryResult = IJobMemory.Initialize(
      id,
      data.targetId,
      data.pos,
      data.amountToTransfer,
      data.fromTargetId,
      data.structureType
    );
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = IJobCache.Initialize(id, data.executer, data.type);
    if (cacheResult.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }
}
