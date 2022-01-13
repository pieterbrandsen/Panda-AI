/* eslint-disable class-methods-use-this */

import { forEach } from "lodash";

export interface IMemory {
  Validate(data: StringMap<MemoryObjects>, type: MemoryTypes): ValidatedMemory;
  ValidateSingle(data: MemoryObjects, type: MemoryTypes): boolean;
  MinimumMemoryVersion(type: MemoryTypes): number;
}

export default abstract class implements IMemory {
  /**
   * Returns minimum memory version for type saved in memory
   */
  MinimumMemoryVersion(type: MemoryTypes): number {
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
   * Check all data in object and return list of non valid memory objects based on version
   */
  Validate(data: StringMap<MemoryObjects>, type: MemoryTypes): ValidatedMemory {
    const minimumVersion = this.MinimumMemoryVersion(type);
    let isValid = true;
    const nonValidMemoryObjects: string[] = [];
    forEach(data, (value, key) => {
      if (value.version < minimumVersion) {
        isValid = false;
        nonValidMemoryObjects.push(key);
      }
    });

    return { isValid, nonValidMemoryObjects };
  }

  /**
   * Check single object and return if its valid based on version
   */
  ValidateSingle(data: MemoryObjects, type: MemoryTypes): boolean {
    const minimumVersion = this.MinimumMemoryVersion(type);
    let isValid = true;
    if (data.version < minimumVersion) {
      isValid = false;
    }

    return isValid;
  }
}
