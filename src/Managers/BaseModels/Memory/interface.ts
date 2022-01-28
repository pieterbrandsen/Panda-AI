/* eslint-disable class-methods-use-this */

import { forEach, pickBy } from "lodash";

export interface IMemory {}

export default abstract class implements IMemory {
  /**
   * Returns minimum memory version for type saved in memory
   */
  protected static MinimumVersion(type: MemoryTypes): number {
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
    predicate?: Predicate<T>
  ): StringMap<T> {
    if (!predicate) {
      return data;
    }

    return pickBy(data, predicate);
  }
}
