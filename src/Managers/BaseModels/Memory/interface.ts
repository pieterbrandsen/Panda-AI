/* eslint-disable class-methods-use-this */

import { forEach, pickBy } from "lodash";

export default abstract class BaseMemoryData {
  protected _type: MemoryTypes;

  constructor(protected type: MemoryTypes) {
    this._type = type;
  }

  /**
   * Returns minimum memory version for type saved in memory
   */
  protected static MinimumMemoryVersion(type: MemoryTypes): number {
    switch (type) {
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

  protected MinimumMemoryVersion(): number {
    return BaseMemoryData.MinimumMemoryVersion(this._type);
  }

  /**
   * Check all data in object and return list of non valid memory objects based on version
   */
  protected static ValidateMemoryData(
    type: MemoryTypes,
    data: StringMap<MemoryObjects>
  ): ValidatedData {
    const minimumVersion = this.MinimumMemoryVersion(type);
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

  protected ValidateMemoryData(data: StringMap<MemoryObjects>): ValidatedData {
    return BaseMemoryData.ValidateMemoryData(this._type, data);
  }

  /**
   * Check single object and return if its valid based on version
   */
  public static ValidateSingleMemoryData(
    type: MemoryTypes,
    data: MemoryObjects
  ): boolean {
    const minimumVersion = this.MinimumMemoryVersion(type);

    let isValid = true;
    if (data.version !== minimumVersion) {
      isValid = false;
    }

    return isValid;
  }

  protected ValidateSingleMemoryData(data: MemoryObjects): boolean {
    return BaseMemoryData.ValidateSingleMemoryData(this._type, data);
  }

  public static GetAllMemoryDataFilter<T extends MemoryObjects>(
    type: MemoryTypes,
    data: StringMap<T>,
    predicate?: Predicate<T>
  ): StringMap<T> {
    const validatedData = this.ValidateMemoryData(type, data);
    forEach(validatedData.nonValidObjects, (key) => {
      delete data[key];
    });

    if (!predicate) {
      return data;
    }

    return pickBy(data, predicate);
  }
}
