import { clone } from "lodash";
import BaseCacheData from "./interface";

export default class JobCacheData extends BaseCacheData {
  private _id:string;
  constructor(id:string) {
    const cacheType:CacheTypes = "Job";
    super(cacheType);
    this._id = id;
  }

  protected ValidateCacheData(data: StringMap<JobCache>): ValidatedData {
    return super.ValidateCacheData(data);
  }

  protected ValidateSingleCacheData(data: JobCache): boolean {
    return super.ValidateSingleCacheData(data);
  }

  /**
   * Create an new object of this type
   */
  protected GenerateCacheData(executer: string, type:JobTypes): JobCache {
    return {
      type,
      executer,
      version: super.MinimumCacheVersion(),
    };
  }

  protected GetCacheData(): CRUDResult<JobCache> {
    const data = clone(Memory.JobsData.cache[this._id]);
    return { success: data !== undefined ? this.ValidateSingleCacheData(data) : false, data };
  }

  protected CreateCacheData(data: JobCache): CRUDResult<JobCache> {
    let getResult = this.GetCacheData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateCacheData(data);
    getResult = this.GetCacheData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  protected UpdateCacheData(data: JobCache): CRUDResult<JobCache> {
    Memory.JobsData.cache[this._id] = data;
    return { success:  Memory.JobsData.cache[this._id] !== undefined, data };
  }

  protected DeleteCacheData(): CRUDResult<JobCache> {
    delete Memory.JobsData.cache[this._id];
    return {success: Memory.CreepsData.cache[this._id] === undefined, data: undefined };
  }

  protected GetAllCacheData(
    executer?: string,
    getOnlyExecuterJobs = true,
    roomsToCheck: string[] = [],
    predicate?: Predicate<JobCache>,
    predicate2?: Predicate<JobCache>
  ): StringMap<JobCache> {
    let data = Memory.JobsData.cache;
    data = super.GetAllCacheDataFilter(
      data,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      predicate,
      predicate2
    );
    return data;
  }

  protected InitializeCacheData(executer: string,
    type: JobTypes
  ): CRUDResult<JobCache> {
    const cache = this.GenerateCacheData(executer, type);
    const result = this.CreateCacheData(cache);
    return { data: result.data, success: result.success };
  }
}
