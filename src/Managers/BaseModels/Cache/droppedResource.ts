import { clone } from "lodash";
import BaseCacheData from "./interface";

export default class DroppedResourceCacheData extends BaseCacheData {
  protected _id:string;
  constructor(id:string) {
    const cacheType:CacheTypes = "DroppedResource";
    super(cacheType);
    this._id = id;
  }

  protected ValidateCacheData(data: StringMap<DroppedResourceCache>): ValidatedData {
    return super.ValidateCacheData(data);
  }

  protected ValidateSingleCacheData(data: DroppedResourceCache): boolean {
    return super.ValidateSingleCacheData(data);
  }

  /**
   * Create an new object of this type
   */
  protected GenerateCacheData(
    executer: string,
    pos: FreezedRoomPosition,
    type: ResourceConstant
  ): DroppedResourceCache {
    return {
      version: super.MinimumCacheVersion(),
      executer,
      pos,
      type,
    };
  }

  protected GetCacheData(): CRUDResult<DroppedResourceCache> {
    const data = clone(Memory.DroppedResourceData.cache[this._id]);
    return { success: data !== undefined ? this.ValidateSingleCacheData(data) : false, data };
  }

  protected CreateCacheData(
    data: DroppedResourceCache
  ): CRUDResult<DroppedResourceCache> {
    let getResult = this.GetCacheData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateCacheData(data);
    getResult = this.GetCacheData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  protected UpdateCacheData(
    data: DroppedResourceCache
  ): CRUDResult<DroppedResourceCache> {
    Memory.DroppedResourceData.cache[this._id] = data;
    return { success:  Memory.DroppedResourceData.cache[this._id] !== undefined, data };
  }

  protected DeleteCacheData(): CRUDResult<DroppedResourceCache> {
    delete Memory.DroppedResourceData.cache[this._id];
    return { success: Memory.DroppedResourceData.cache[this._id] === undefined, data: undefined };
  }

  public static GetAllCacheData(
    type:CacheTypes,
    executer = "",
    getOnlyExecuterJobs = true,
    roomsToCheck: string[] = [],
    predicate?: Predicate<DroppedResourceCache>
  ): StringMap<DroppedResourceCache> {
    let data = Memory.DroppedResourceData.cache;
    data = super.GetAllCacheDataFilter(type,
      data,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      predicate
    );
    return data;
  }

  protected InitializeCacheData(
    executer: string,
    pos: FreezedRoomPosition,
    type: ResourceConstant
  ): CRUDResult<DroppedResourceCache> {
    const cache = this.GenerateCacheData(executer, pos, type);
    const createResult = this.CreateCacheData( cache);
    return { data: createResult.data, success: createResult.success };
  }
}
