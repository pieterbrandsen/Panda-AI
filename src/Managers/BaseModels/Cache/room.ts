import { clone } from "lodash";
import BaseCacheData from "./interface";

export default class RoomCacheData extends BaseCacheData {
  protected _id: string;

  constructor(id: string) {
    const cacheType: CacheTypes = "Room";
    super(cacheType);
    this._id = id;
  }

  protected ValidateCacheData(data: StringMap<RoomCache>): ValidatedData {
    return super.ValidateCacheData(data);
  }

  protected ValidateSingleCacheData(data: RoomCache): boolean {
    return super.ValidateSingleCacheData(data);
  }

  /**
   * Create an new object of this type
   */
  protected GenerateCacheData(): RoomCache {
    return {
      version: super.MinimumCacheVersion(),
      executer: "",
    };
  }

  protected GetCacheData(): CRUDResult<RoomCache> {
    const data = clone(Memory.RoomsData.cache[this._id]);
    return {
      success: data !== undefined ? this.ValidateSingleCacheData(data) : false,
      data,
    };
  }

  protected CreateCacheData(data: RoomCache): CRUDResult<RoomCache> {
    let getResult = this.GetCacheData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateCacheData(data);
    getResult = this.GetCacheData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  protected UpdateCacheData(data: RoomCache): CRUDResult<RoomCache> {
    Memory.RoomsData.cache[this._id] = data;
    return { success: Memory.RoomsData.cache[this._id] !== undefined, data };
  }

  protected DeleteCacheData(): CRUDResult<RoomCache> {
    delete Memory.RoomsData.cache[this._id];
    return {
      success: Memory.RoomsData.cache[this._id] === undefined,
      data: undefined,
    };
  }

  protected static GetAllCacheData(
    type: CacheTypes,
    executer = "",
    getOnlyExecuterJobs = true,
    roomsToCheck: string[] = [],
    predicate?: Predicate<RoomCache>
  ): StringMap<RoomCache> {
    let data = Memory.RoomsData.cache;
    data = super.GetAllCacheDataFilter(
      type,
      data,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      predicate
    );
    return data;
  }

  protected InitializeCacheData(): CRUDResult<RoomCache> {
    const cache = this.GenerateCacheData();
    const result = this.CreateCacheData(cache);
    return { data: result.data, success: result.success };
  }
}
