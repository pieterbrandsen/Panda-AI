import { clone } from "lodash";
import BaseCacheData from "./interface";

export default class CreepCacheData extends BaseCacheData {
  protected _id: string;

  constructor(id: string) {
    const cacheType: CacheTypes = "Creep";
    super(cacheType);
    this._id = id;
  }

  protected ValidateCacheData(data: StringMap<CreepCache>): ValidatedData {
    return super.ValidateCacheData(data);
  }

  protected ValidateSingleCacheData(data: CreepCache): boolean {
    return super.ValidateSingleCacheData(data);
  }

  /**
   * Create an new object of this type
   */
  protected GenerateCacheData(
    executer: string,
    body: BodyParts,
    pos: FreezedRoomPosition,
    type: CreepTypes
  ): CreepCache {
    return {
      version: super.MinimumCacheVersion(),
      executer,
      body,
      pos,
      type,
    };
  }

  protected GetCacheData(): CRUDResult<CreepCache> {
    const data = clone(Memory.CreepsData.cache[this._id]);
    return {
      success: data !== undefined ? this.ValidateSingleCacheData(data) : false,
      data,
    };
  }

  protected CreateCacheData(data: CreepCache): CRUDResult<CreepCache> {
    let getResult = this.GetCacheData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateCacheData(data);
    getResult = this.GetCacheData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  protected UpdateCacheData(data: CreepCache): CRUDResult<CreepCache> {
    Memory.CreepsData.cache[this._id] = data;
    return { success: Memory.CreepsData.cache[this._id] !== undefined, data };
  }

  protected DeleteCacheData(): CRUDResult<CreepCache> {
    delete Memory.CreepsData.cache[this._id];
    return {
      success: Memory.CreepsData.cache[this._id] === undefined,
      data: undefined,
    };
  }

  protected static GetAllCacheData(
    type: CacheTypes,
    executer?: string,
    getOnlyExecuterJobs?: boolean,
    roomsToCheck?: string[],
    predicate?: Predicate<CreepCache>
  ): StringMap<CreepCache> {
    let data = Memory.CreepsData.cache;
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

  protected InitializeCacheData(
    executer: string,
    body: BodyParts,
    pos: FreezedRoomPosition,
    type: CreepTypes
  ): CRUDResult<CreepCache> {
    const cache = this.GenerateCacheData(executer, body, pos, type);
    const createResult = this.CreateCacheData(cache);
    return { data: createResult.data, success: createResult.success };
  }
}
