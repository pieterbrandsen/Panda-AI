import { forEach } from "lodash";
import { Mixin } from "ts-mixer";
import CreepMemoryData from "../../Memory/creep";
import CreepCacheData from "../../Cache/creep";
import CreepHeapData from "../../Heap/creep";

export default class CreepData extends Mixin(
  CreepHeapData,
  CreepMemoryData,
  CreepCacheData
) {
  public static cacheType: CacheTypes = "Creep";

  public static memoryType: MemoryTypes = "Creep";

  protected _id: string;

  constructor(id: string) {
    const heapType: HeapTypes = "Creep";
    super(id, heapType);
    this._id = id;
  }

  public GetData(): DoubleCRUDResult<CreepMemory, CreepCache> {
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = this.GetMemoryData();
    if (memoryResult.success) {
      result.memory = memoryResult.data;
    }
    const cacheResult = this.GetCacheData();
    if (cacheResult.success) {
      result.cache = cacheResult.data;
    }

    if (result.cache !== undefined && result.memory !== undefined)
      result.success = true;
    return result;
  }

  public CreateData(
    memory: CreepMemory,
    cache: CreepCache
  ): DoubleCRUDResult<CreepMemory, CreepCache> {
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryResult = this.CreateMemoryData(memory);
    if (memoryResult.success) {
      result.memory = memoryResult.data;
    }

    const cacheResult = this.CreateCacheData(cache);
    if (cacheResult.success) {
      result.cache = cacheResult.data;
    }

    if (result.cache !== undefined && result.memory !== undefined)
      result.success = true;
    else this.DeleteData();

    return result;
  }

  public DeleteData(): DoubleCRUDResult<CreepMemory, CreepCache> {
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const data = this.GetData();
    if (data.success) {
      const memoryResult = this.DeleteMemoryData();
      if (memoryResult.success) {
        result.memory = data.memory;
      }

      const cacheResult = this.DeleteCacheData();
      if (cacheResult.success) {
        result.cache = cacheResult.data;
      }
    }

    if (result.cache !== undefined && result.memory !== undefined)
      result.success = true;
    else this.CreateData(data.memory as CreepMemory, data.cache as CreepCache);
    return result;
  }

  public UpdateData(
    memory: CreepMemory,
    cache: CreepCache
  ): DoubleCRUDResult<CreepMemory, CreepCache> {
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const updateMemoryResult = this.UpdateMemoryData(memory);
    if (updateMemoryResult.success) {
      result.memory = updateMemoryResult.data;
    }
    const updateCacheResult = this.UpdateCacheData(cache);
    if (updateCacheResult.success) {
      result.cache = updateCacheResult.data;
    }

    return result;
  }

  public InitializeData(
    data: CreepInitializationData
  ): DoubleCRUDResult<CreepMemory, CreepCache> {
    const result: DoubleCRUDResult<CreepMemory, CreepCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryResult = this.InitializeMemoryData(
      data.name,
      data.isRemoteCreep
    );
    if (memoryResult.success) {
      result.memory = memoryResult.data;
    }

    const cacheResult = this.InitializeCacheData(
      data.executer,
      data.body,
      data.pos,
      data.type
    );
    if (cacheResult.success && result.success) {
      result.cache = cacheResult.data;
    }

    if (result.cache !== undefined && result.memory !== undefined)
      result.success = true;
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
        ? CreepMemoryData.GetAllMemoryData(this.memoryType, predicateMemory)
        : CreepCacheData.GetAllCacheData(
            this.cacheType,
            executer,
            getOnlyExecuterJobs,
            roomsToCheck,
            predicateCache
          )
    );
    forEach(ids, (id) => {
      const repository = new CreepData(id);
      const dataResult = repository.GetData();
      if (dataResult.success) {
        result[id] = {
          success: true,
          memory: dataResult.memory,
          cache: dataResult.cache,
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
