import { clone, forEach } from "lodash";
import BaseMemory from "./interface";

interface IGlobalMemory {
  ValidateSingle(): boolean;
}

export default class extends BaseMemory implements IGlobalMemory {
  private type: MemoryTypes = "Global";

  ValidateSingle(): boolean {
    return super.MinimumVersion(this.type) === Memory.version;
  }

  /**
   * Create an new object of this type
   */
  static Generate(): Memory {
    const defaultObject = {
      creeps: {},
      flags: {},
      powerCreeps: {},
      rooms: {},
      spawns: {},
    };
    const defaultMainMemoryData = { data: {}, cache: {} };
    return {
      ...{
        version: 0,
        CreepsData: {
          ...defaultMainMemoryData,
          version: 0,
        },
        RoomsData: {
          ...defaultMainMemoryData,
          version: 0,
        },
        StructuresData: {
          ...defaultMainMemoryData,
          version: 0,
        },
        JobsData: {
          ...defaultMainMemoryData,
          version: 0,
        },
      },
      ...defaultObject,
    };
  }

  static Get(): CRUDResult<Memory> {
    const data = clone(Memory);
    return { success: !!data, data };
  }

  static Update(data: Memory): CRUDResult<Memory> {
    forEach(data, (value: unknown, key: string) => {
      Memory[key] = value;
    });
    return { success: true, data };
  }

  static Initialize(): boolean {
    return this.Update(this.Generate()).success;
  }
}
