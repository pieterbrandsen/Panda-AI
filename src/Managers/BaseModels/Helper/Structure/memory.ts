import { forEach } from "lodash";
import { Mixin } from "ts-mixer";
import StructureMemoryData from "../../Memory/structure";
import StructureCacheData from "../../Cache/structure";
import StructureHeapData from "../../Heap/structure";

export default class StructureData extends Mixin(
  StructureHeapData,
  StructureMemoryData,
  StructureCacheData
) {
  public static cacheType: CacheTypes = "Creep";

  public static memoryType: MemoryTypes = "Creep";

  public _id: string;

  constructor(id: string) {
    super(id);
    this._id = id;
  }

  public HeapDataRepository = {
    GetData: super.GetHeapData,
    CreateData: super.CreateHeapData,
    DeleteData: super.DeleteHeapData,
    UpdateData: super.UpdateHeapData,
    InitializeData: super.InitializeHeapData,
    GenerateData: super.GenerateHeapData,
  };

  public GetData(): DoubleCRUDResult<StructureMemory, StructureCache> {
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
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
    memory: StructureMemory,
    cache: StructureCache
  ): DoubleCRUDResult<StructureMemory, StructureCache> {
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
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

  public DeleteData(): DoubleCRUDResult<StructureMemory, StructureCache> {
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
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
        data.memory as StructureMemory,
        data.cache as StructureCache
      );
    return result;
  }

  public UpdateData(
    memory: StructureMemory,
    cache: StructureCache
  ): DoubleCRUDResult<StructureMemory, StructureCache> {
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
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
    data: StructureInitializationData
  ): DoubleCRUDResult<StructureMemory, StructureCache> {
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = this.InitializeMemoryData(data.isSource);
    if (memoryResult.success) {
      result.memory = memoryResult.data;
    }
    const cacheResult = this.InitializeCacheData(data.structure, data.executer);
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
    predicateMemory?: Predicate<StructureMemory>,
    predicateCache?: Predicate<StructureCache>,
    predicateCache2?: Predicate<StructureCache>
  ): StringMap<DoubleCRUDResult<StructureMemory, StructureCache>> {
    const result: StringMap<
      DoubleCRUDResult<StructureMemory, StructureCache>
    > = {};
    const ids = Object.keys(
      isMemory
        ? this.GetAllMemoryData(this.memoryType, predicateMemory)
        : this.GetAllCacheData(
            this.cacheType,
            executer,
            getOnlyExecuterJobs,
            roomsToCheck,
            predicateCache,
            predicateCache2
          )
    );
    forEach(ids, (id) => {
      const repository = new StructureData(id);
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

  public static GetAllDataMemoryBasedOnMemory(
    predicate?: Predicate<StructureMemory>
  ): StringMap<DoubleCRUDResult<StructureMemory, StructureCache>> {
    return this.GetAllData(true, undefined, undefined, undefined, predicate);
  }

  public static GetAllDataBasedOnCache(
    executer = "",
    getOnlyExecuterJobs = false,
    roomsToCheck?: string[],
    predicate?: Predicate<StructureCache>,
    predicate2?: Predicate<StructureCache>
  ): StringMap<DoubleCRUDResult<StructureMemory, StructureCache>> {
    return this.GetAllData(
      false,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      undefined,
      predicate,
      predicate2
    );
  }
}
