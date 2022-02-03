import ICreepMemory from "../../Memory/creepInterface";
import ICreepCache from "../../Cache/creepInterface";

interface ICreepHelper {}

export default class implements ICreepHelper {
  static GetMemory(id: string): DoubleCRUDResult<CreepMemory, CreepCache> {
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = ICreepMemory.Get(id);
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = ICreepCache.Get(id);
    if (cacheResult.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }

  static CreateMemory(
    id: string,
    memory: CreepMemory,
    cache: CreepCache
  ): DoubleCRUDResult<CreepMemory, CreepCache> {
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryResult = ICreepMemory.Create(id, memory);
    if (memoryResult.success) {
      result.memory = memoryResult.data;
      result.success = true;
    }

    const cacheResult = ICreepCache.Create(id, cache);
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
  ): DoubleCRUDResult<CreepMemory, CreepCache> {
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    
    const memoryData = ICreepMemory.Get(id);
    if (memoryData.success) {
      const memory = memoryData.data as CreepMemory;
      delete Memory.creeps[memory.name];
    }

    if (isMemory && result.success) {
      const deleteResult = ICreepMemory.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.memory = deleteResult.data;
      }
    }
    if (isCache && result.success) {
      const deleteResult = ICreepCache.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.cache = deleteResult.data;
      }
    }
    return result;
  }

  static UpdateMemory(
    id: string,
    memory?: CreepMemory,
    cache?: CreepCache
  ): DoubleCRUDResult<CreepMemory, CreepCache> {
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    if (memory) {
      const updateResult = ICreepMemory.Update(id, memory);
      if (updateResult.success) {
        result.success = true;
        result.memory = updateResult.data;
      }
    }
    if (cache && result.success) {
      const updateResult = ICreepCache.Update(id, cache);
      if (updateResult.success) {
        result.success = true;
        result.cache = updateResult.data;
      }
    }

    return result;
  }

  static Initialize(
    data: CreepInitializationData
  ): DoubleCRUDResult<CreepMemory, CreepCache> {
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryResult = ICreepMemory.Initialize(
      data.id,
      data.name,
      data.isRemoteCreep
    );
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = ICreepCache.Initialize(
      data.id,
      data.executer,
      data.body,
      data.pos,
      data.type
    );
    if (cacheResult.success && result.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }
}
