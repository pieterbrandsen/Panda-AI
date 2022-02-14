/* eslint-disable class-methods-use-this */

import { forEach, pickBy } from "lodash";

export default abstract class MemoryData {
  /**
   * Returns minimum memory version for type saved in memory
   */
  protected static MinimumVersion(type: MemoryTypes): number {
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

  /**
   * Check all data in object and return list of non valid memory objects based on version
   */
  protected static Validate(
    data: StringMap<MemoryObjects>,
    type: MemoryTypes
  ): ValidatedData {
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
  protected static ValidateSingle(
    data: MemoryObjects,
    type: MemoryTypes
  ): boolean {
    const minimumVersion = this.MinimumVersion(type);

    let isValid = true;
    if (data.version !== minimumVersion) {
      isValid = false;
    }

    return isValid;
  }

  protected static GetAllData<T extends MemoryObjects>(
    data: StringMap<T>,
    type: MemoryTypes,
    predicate?: Predicate<T>
  ): StringMap<T> {
    const validatedData = this.Validate(data, type);
    forEach(validatedData.nonValidObjects, (key) => {
      delete data[key];
    });

    if (!predicate) {
      return data;
    }

    return pickBy(data, predicate);
  }
}
