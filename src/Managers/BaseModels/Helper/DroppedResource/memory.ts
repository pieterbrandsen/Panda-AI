import { forEach } from "lodash";
import { Mixin } from "ts-mixer";
import DroppedResourceMemoryData from "../../Memory/droppedResource";
import DroppedResourceCacheData from "../../Cache/droppedResource";

export default class DroppedResourceData extends Mixin(
  DroppedResourceMemoryData,
  DroppedResourceCacheData
) {
  public static cacheType: CacheTypes = "DroppedResource";

  public static memoryType: MemoryTypes = "DroppedResource";

  protected _id: string;

  constructor(id: string) {
    super(id);
    this._id = id;
  }

  public GetData(): DoubleCRUDResult<
    DroppedResourceMemory,
    DroppedResourceCache
  > {
    const result: DoubleCRUDResult<
      DroppedResourceMemory,
      DroppedResourceCache
    > = {
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
    memory: DroppedResourceMemory,
    cache: DroppedResourceCache
  ): DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> {
    const result: DoubleCRUDResult<
      DroppedResourceMemory,
      DroppedResourceCache
    > = {
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

  public DeleteData(): DoubleCRUDResult<
    DroppedResourceMemory,
    DroppedResourceCache
  > {
    const result: DoubleCRUDResult<
      DroppedResourceMemory,
      DroppedResourceCache
    > = {
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
    else
      this.CreateData(
        data.memory as DroppedResourceMemory,
        data.cache as DroppedResourceCache
      );
    return result;
  }

  public UpdateData(
    memory: DroppedResourceMemory,
    cache: DroppedResourceCache
  ): DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> {
    const result: DoubleCRUDResult<
      DroppedResourceMemory,
      DroppedResourceCache
    > = {
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
    data: DroppedResourceInitializationData
  ): DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> {
    const result: DoubleCRUDResult<
      DroppedResourceMemory,
      DroppedResourceCache
    > = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = this.InitializeMemoryData();
    if (memoryResult.success) {
      result.memory = memoryResult.data;
    }

    const cacheResult = this.InitializeCacheData(
      data.executer,
      data.resource.pos,
      data.resource.resourceType
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
    predicateMemory?: Predicate<DroppedResourceMemory>,
    predicateCache?: Predicate<DroppedResourceCache>
  ): StringMap<DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache>> {
    const result: StringMap<
      DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache>
    > = {};
    const ids = Object.keys(
      isMemory
        ? DroppedResourceMemoryData.GetAllMemoryData(
            this.memoryType,
            predicateMemory
          )
        : DroppedResourceCacheData.GetAllCacheData(
            this.cacheType,
            executer,
            getOnlyExecuterJobs,
            roomsToCheck,
            predicateCache
          )
    );
    forEach(ids, (id) => {
      const repository = new DroppedResourceData(id);
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
    predicate?: Predicate<DroppedResourceMemory>
  ): StringMap<DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache>> {
    return this.GetAllData(true, undefined, undefined, undefined, predicate);
  }

  public static GetAllDataBasedOnCache(
    executer = "",
    getOnlyExecuterJobs = false,
    roomsToCheck?: string[],
    predicate?: Predicate<DroppedResourceCache>
  ): StringMap<DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache>> {
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
