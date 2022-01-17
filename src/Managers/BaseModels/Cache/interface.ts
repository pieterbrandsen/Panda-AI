// TODO: Update All
// *^ LATER

import Predicates from "./predicates";
import { forEach, pickBy } from "lodash";

interface ICache {
  Validate(data: StringMap<CacheObjects>, type: CacheTypes): ValidatedData;
  ValidateSingle(data: CacheObjects, type: CacheTypes): boolean;
  MinimumVersion(type: CacheTypes): number;
}

export default class implements ICache {
  /**
   * Returns minimum cache version for type saved in cache
   */
  MinimumVersion(type: CacheTypes): number {
    switch (type) {
      case "Creep":
        return Memory.CreepsData.version;
      case "Structure":
        return Memory.StructuresData.version;
      case "Room":
        return Memory.RoomsData.version;
      default:
        return 999;
    }
  }

  /**
   * Check all data in object and return list of non valid cache objects based on version
   */
  Validate(data: StringMap<CacheObjects>, type: CacheTypes): ValidatedData {
    const minimumVersion = this.MinimumVersion(type);
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

  /**
   * Check single object and return if its valid based on version
   */
  ValidateSingle(data: CacheObjects, type: CacheTypes): boolean {
    const minimumVersion = this.MinimumVersion(type);
    let isValid = true;
    if (data.version < minimumVersion) {
      isValid = false;
    }

    return isValid;
  }

  protected static GetAllData<T extends CacheObjects>(data:StringMap<T>,executer?:string,getOnlyExecuterJobs = true,predicate?: Predicate<T>,predicate2?:Predicate<T>): StringMap<T> {
    if (getOnlyExecuterJobs) {
      data = pickBy(data,Predicates.IsExecuter(executer));
    }

    if (!predicate) {
      return data;
    }
    const filterData = pickBy(data, predicate);
    if (!predicate2) {
      return filterData;
    }

    return pickBy(filterData,predicate2);
  }
}
