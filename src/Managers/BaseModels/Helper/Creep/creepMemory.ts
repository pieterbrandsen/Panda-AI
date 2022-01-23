import ICreepMemory from "../../Memory/creepInterface";
import ICreepCache from "../../Cache/creepInterface";

interface ICreepHelper {}

export default class implements ICreepHelper {
  static GetCreepId(name: string): string {
    return name;
  }

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
  ): DoubleCRUDResult<CreepMemory, CreepCache> {
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    if (isMemory) {
      const deleteResult = ICreepMemory.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.memory = deleteResult.data;
      }
    }
    if (isCache) {
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
    if (cache) {
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
    const id = this.GetCreepId(data.name);
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = ICreepMemory.Initialize(id, data.isRemoteCreep);
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = ICreepCache.Initialize(
      id,
      data.executer,
      data.body,
      data.pos,
      data.type
    );
    if (cacheResult.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }
}
