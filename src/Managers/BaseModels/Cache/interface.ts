// TODO: Update All
// *^ LATER

import { forEach, pickBy } from "lodash";
import Predicates from "./predicates";

export default abstract class BaseCacheData {
  protected _type: CacheTypes;
  constructor(type:CacheTypes) {
    this._type = type;
  }

  /**
   * Returns minimum cache version for type saved in cache
   */
  protected static MinimumCacheVersion(type: CacheTypes): number {
    switch (type) {
      case "Creep":
        return Memory.CreepsData.version;
      case "Structure":
        return Memory.StructuresData.version;
      case "Room":
        return Memory.RoomsData.version;
      case "Job":
        return Memory.JobsData.version;
      default:
        return 999;
    }
  }

  protected MinimumCacheVersion(): number {
    return BaseCacheData.MinimumCacheVersion(this._type);
  }

  /**
   * Check all data in object and return list of non valid cache objects based on version
   */
  protected static ValidateCacheData(
    type:CacheTypes,
    data: StringMap<CacheObjects>,
  ): ValidatedData {
    const minimumVersion = this.MinimumCacheVersion(type);
    let isValid = true;
    const nonValidObjects: string[] = [];
    forEach(data, (value, key) => {
      if (value.version < minimumVersion) {
        isValid = false;
        nonValidObjects.push(key);
      }
    });

    return { isValid, nonValidObjects };
  }

  protected ValidateCacheData(
    data: StringMap<CacheObjects>,
  ): ValidatedData {
    return BaseCacheData.ValidateCacheData(this._type, data);
  }

  /**
   * Check single object and return if its valid based on version
   */
  protected static ValidateSingleCacheData(type:CacheTypes, data: CacheObjects): boolean {
    const minimumVersion = this.MinimumCacheVersion(type);
    let isValid = true;
    if (data.version < minimumVersion) {
      isValid = false;
    }

    return isValid;
  }
  protected ValidateSingleCacheData(data: CacheObjects): boolean {
    return BaseCacheData.ValidateSingleCacheData(this._type, data);
  }

  protected static GetAllCacheDataFilter<T extends CacheObjects>(
    type:CacheTypes, data: StringMap<T>,
    executer?: string,
    getOnlyExecuterJobs = true,
    roomsToCheck: string[] = [],
    predicate?: Predicate<T>,
    predicate2?: Predicate<T>
  ): StringMap<T> {
    const validatedData = this.ValidateCacheData(type,data);
    forEach(validatedData.nonValidObjects, (key) => {
      delete data[key];
    });

    if (roomsToCheck.length > 0) {
      data = pickBy(data, Predicates.IsInRoomNameArray(roomsToCheck));
    }
    if (getOnlyExecuterJobs) {
      data = pickBy(data, Predicates.IsExecuter(executer));
    }

    if (!predicate) {
      return data;
    }
    const filterData = pickBy(data, predicate);
    if (!predicate2) {
      return filterData;
    }

    return pickBy(filterData, predicate2);
  }
}
