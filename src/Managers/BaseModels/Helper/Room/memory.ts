import { forEach } from "lodash";
import RoomMemoryData from "../../Memory/room";
import RoomCacheData from "../../Cache/room";
import RoomHeapData from "../../Heap/room";
import { Mixin } from "ts-mixer";

export default class RoomData extends Mixin(RoomHeapData,RoomMemoryData,RoomCacheData) {
  public static cacheType: CacheTypes = "Room"; 
  public static memoryType: MemoryTypes = "Room"; 
  protected _id: string;

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

  protected GetData(): DoubleCRUDResult<RoomMemory, RoomCache> {
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
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
    memory: RoomMemory,
    cache: RoomCache
  ): DoubleCRUDResult<RoomMemory, RoomCache> {
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
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

  public DeleteData(): DoubleCRUDResult<RoomMemory, RoomCache> {
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
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
    else this.CreateData(data.memory as RoomMemory, data.cache as RoomCache);
    return result;
  }

  public UpdateData(
    memory: RoomMemory,
    cache: RoomCache
  ): DoubleCRUDResult<RoomMemory, RoomCache> {
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
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
    data: RoomInitializationData
  ): DoubleCRUDResult<RoomMemory, RoomCache> {
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = this.InitializeMemoryData(
      data.room,
      data.remoteRooms
    );
    if (memoryResult.success) {
      result.memory = memoryResult.data;
    }
    const cacheResult = this.InitializeCacheData();
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
    predicateMemory?: Predicate<RoomMemory>,
    predicateCache?: Predicate<RoomCache>
  ): StringMap<DoubleCRUDResult<RoomMemory, RoomCache>> {
    const result: StringMap<DoubleCRUDResult<RoomMemory, RoomCache>> = {};
    const names = Object.keys(
      isMemory
        ? this.GetAllMemoryData(this.memoryType,predicateMemory)
        : this.GetAllCacheData(this.cacheType,
            executer,
            getOnlyExecuterJobs,
            roomsToCheck,
            predicateCache
          )
    );
    forEach(names, (name) => {
      const repository = new RoomData(name);
      const dataResult = repository.GetData();
      if (dataResult.success) {
        result[name] = {
          success: true,
          memory: dataResult.memory,
          cache: dataResult.cache,
        };
      }
    });

    return result;
  }

  public static GetAllDataBasedOnMemory(
    predicate?: Predicate<RoomMemory>
  ): StringMap<DoubleCRUDResult<RoomMemory, RoomCache>> {
    return this.GetAllData(true, undefined, undefined, undefined, predicate);
  }

  static GetAllDataBasedOnCache(
    executer = "",
    getOnlyExecuterJobs = false,
    roomsToCheck?: string[],
    predicate?: Predicate<RoomCache>
  ): StringMap<DoubleCRUDResult<RoomMemory, RoomCache>> {
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
