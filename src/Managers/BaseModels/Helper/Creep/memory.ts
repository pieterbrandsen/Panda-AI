import { forEach } from "lodash";
import CreepMemoryData from "../../Memory/creep";
import CreepCacheData from "../../Cache/creep";
import CreepHeapData from "../../Heap/creep";

export default class CreepData extends CreepHeapData {
  protected _creepInformation: CreepInformation;

  constructor(creepInformation: CreepInformation) {
    super(creepInformation.id);
    this._creepInformation = creepInformation;
  }

  protected GetData(): DoubleCRUDResult<CreepMemory, CreepCache> {
    const { id } = this._creepInformation;
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = CreepMemoryData.Get(id);
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = CreepCacheData.Get(id);
    if (cacheResult.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }

  protected CreateData(
    memory: CreepMemory,
    cache: CreepCache
  ): DoubleCRUDResult<CreepMemory, CreepCache> {
    const { id } = this._creepInformation;
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryResult = CreepMemoryData.Create(id, memory);
    if (memoryResult.success) {
      result.memory = memoryResult.data;
      result.success = true;
    }

    const cacheResult = CreepCacheData.Create(id, cache);
    if (cacheResult.success && result.success) {
      result.cache = cacheResult.data;
      result.success = true;
    }

    return result;
  }

  protected DeleteData(
    isMemory: boolean,
    isCache: boolean
  ): DoubleCRUDResult<CreepMemory, CreepCache> {
    const { id } = this._creepInformation;
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryData = CreepMemoryData.Get(id);
    if (memoryData.success) {
      const memory = memoryData.data as CreepMemory;
      delete Memory.creeps[memory.name];
    }

    if (isMemory) {
      const deleteResult = CreepMemoryData.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.memory = deleteResult.data;
      }
    }
    if (isCache && result.success) {
      const deleteResult = CreepCacheData.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.cache = deleteResult.data;
      }
    }
    return result;
  }

  protected UpdateData(
    memory?: CreepMemory,
    cache?: CreepCache
  ): DoubleCRUDResult<CreepMemory, CreepCache> {
    const { id } = this._creepInformation;
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    if (memory) {
      const updateResult = CreepMemoryData.Update(id, memory);
      if (updateResult.success) {
        result.success = true;
        result.memory = updateResult.data;
      }
    }
    if (cache && result.success) {
      const updateResult = CreepCacheData.Update(id, cache);
      if (updateResult.success) {
        result.success = true;
        result.cache = updateResult.data;
      }
    }

    return result;
  }

  protected InitializeData(
    data: CreepInitializationData
  ): DoubleCRUDResult<CreepMemory, CreepCache> {
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryResult = CreepMemoryData.Initialize(
      data.id,
      data.name,
      data.isRemoteCreep
    );
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = CreepCacheData.Initialize(
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

  public static GetAllData(
    isMemory: boolean,
    executer?: string,
    getOnlyExecuterJobs?: boolean,
    roomsToCheck?: string[],
    predicateMemory?: Predicate<CreepMemory>,
    predicateCache?: Predicate<CreepCache>
  ): StringMap<DoubleCRUDResult<CreepMemory, CreepCache>> {
    const result: StringMap<DoubleCRUDResult<CreepMemory, CreepCache>> = {};
    const ids = Object.keys(
      isMemory
        ? CreepMemoryData.GetAll(predicateMemory)
        : CreepCacheData.GetAll(
            executer,
            getOnlyExecuterJobs,
            roomsToCheck,
            predicateCache
          )
    );
    forEach(ids, (id) => {
      const memoryResult = CreepMemoryData.Get(id);
      const cacheResult = CreepCacheData.Get(id);
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

  public static GetAllDataBasedOnMemory(
    predicate?: Predicate<CreepMemory>
  ): StringMap<DoubleCRUDResult<CreepMemory, CreepCache>> {
    return this.GetAllData(true, undefined, undefined, undefined, predicate);
  }

  public static GetAllDataBasedOnCache(
    executer = "",
    getOnlyExecuterJobs = false,
    roomsToCheck?: string[],
    predicate?: Predicate<CreepCache>
  ): StringMap<DoubleCRUDResult<CreepMemory, CreepCache>> {
    return this.GetAllData(
      false,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      undefined,
      predicate
    );
  }
}
