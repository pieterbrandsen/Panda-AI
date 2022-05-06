/* eslint-disable class-methods-use-this */

import { forEach, pickBy } from "lodash";

export default abstract class BaseMemoryData {
  private _type:MemoryTypes;
  constructor(protected type: MemoryTypes) {
    this._type = type;
  }

  /**
   * Returns minimum memory version for type saved in memory
   */
  protected MinimumMemoryVersion(): number {
    switch (this._type) {
      case "Creep":
        if (Memory.CreepsData) return Memory.CreepsData.version;
        break;
      case "Structure":
        if (Memory.StructuresData) return Memory.StructuresData.version;
        break;
      case "Room":
        if (Memory.RoomsData) return Memory.RoomsData.version;
        break;
      case "Job":
        if (Memory.JobsData) return Memory.JobsData.version;
        break;
      case "DroppedResource":
        if (Memory.DroppedResourceData)
          return Memory.DroppedResourceData.version;
        break;
      case "Stats":
        if (Memory.stats) return Memory.stats.version;
        break;
      case "Log":
        if (Memory.logs) return Memory.logs.version;
        break;
      // skip default case
    }
    return 999;
  }

  /**
   * Check all data in object and return list of non valid memory objects based on version
   */
  protected ValidateMemoryData(
    data: StringMap<MemoryObjects>
      ): ValidatedData {
    const minimumVersion = this.MinimumMemoryVersion();
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
  protected ValidateSingleMemoryData(
    data: MemoryObjects,
  ): boolean {
    const minimumVersion = this.MinimumMemoryVersion();

    let isValid = true;
    if (data.version !== minimumVersion) {
      isValid = false;
    }

    return isValid;
  }

  protected GetAllMemoryDataFilter<T extends MemoryObjects>(
    data: StringMap<T>,    
    predicate?: Predicate<T>
  ): StringMap<T> {
    const validatedData = this.ValidateMemoryData(data);
    forEach(validatedData.nonValidObjects, (key) => {
      delete data[key];
    });

    if (!predicate) {
      return data;
    }

    return pickBy(data, predicate);
  }
}
