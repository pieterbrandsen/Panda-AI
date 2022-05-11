import { forEach } from "lodash";
import JobMemoryData from "../../Memory/job";
import JobCacheData from "../../Cache/job";
import { Mixin } from "ts-mixer";

export default class JobData extends Mixin(JobMemoryData,JobCacheData) {
  public static cacheType: CacheTypes = "Job"; 
  public static memoryType: MemoryTypes = "Job"; 
  protected _id: string;

    constructor(forcedId:string="",type?: JobTypes, pos?: FreezedRoomPosition) {
      const id = type !== undefined && pos !== undefined ? `${type}_${pos.x}_${pos.y}_${pos.roomName}`: forcedId;
    super(id);
    this._id = id;
  }

  public GetData(): DoubleCRUDResult<JobMemory, JobCache> {
    const result: DoubleCRUDResult<JobMemory, JobCache> = {
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
    memory: JobMemory,
    cache: JobCache
  ): DoubleCRUDResult<JobMemory, JobCache> {
    const result: DoubleCRUDResult<JobMemory, JobCache> = {
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

  protected DeleteData(
  ): DoubleCRUDResult<JobMemory, JobCache> {
    const result: DoubleCRUDResult<JobMemory, JobCache> = {
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
    else this.CreateData(data.memory as JobMemory, data.cache as JobCache);
    return result;
  }

  public static DeleteAllData(roomName: string): void {
    const jobIds = Object.keys(JobCacheData.GetAllCacheData(this.cacheType,"", false, [roomName]));

    forEach(jobIds, (id) => {
      const repo = new JobData(id)
      repo.DeleteData();
    });
  }

  public UpdateData(
    memory: JobMemory,
    cache: JobCache
  ): DoubleCRUDResult<JobMemory, JobCache> {
    const result: DoubleCRUDResult<JobMemory, JobCache> = {
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
    data: JobInitializationData
  ): DoubleCRUDResult<JobMemory, JobCache> {
    const result: DoubleCRUDResult<JobMemory, JobCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = this.InitializeMemoryData(
      data.targetId,
      data.pos,
      data.objectType,
      data.amountToTransfer,
      data.fromTargetId,
      data.structureType,
      data.maxCreepsCount
    );
    if (memoryResult.success) {
      result.memory = memoryResult.data;
    }
    const cacheResult = this.InitializeCacheData(data.executer, data.type);
    if (cacheResult.success && result.success) {
      result.cache = cacheResult.data;
    }
    if (result.cache !== undefined && result.memory !== undefined)
      result.success = true;
    return result;
  }

  public static GetAllData(
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
        ? JobMemoryData.GetAllMemoryData(this.memoryType,getOnlyFreeJobs, predicateMemory)
        : JobCacheData.GetAllCacheData(this.cacheType,
            executer,
            getOnlyExecuterJobs,
            roomsToCheck,
            predicateCache
          )
    );
    forEach(ids, (id) => {
      const repository = new JobData(id);
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
    getOnlyFreeJobs = false,
    predicate?: Predicate<JobMemory>
  ): StringMap<DoubleCRUDResult<JobMemory, JobCache>> {
    return this.GetAllData(
      true,
      getOnlyFreeJobs,
      undefined,
      undefined,
      undefined,
      predicate
    );
  }

  public static  GetAllDataBasedOnCache(
    executer = "",
    getOnlyExecuterJobs = false,
    roomsToCheck?: string[],
    predicate?: Predicate<JobCache>
  ): StringMap<DoubleCRUDResult<JobMemory, JobCache>> {
    return this.GetAllData(
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
