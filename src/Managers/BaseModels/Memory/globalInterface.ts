import { clone, forEach } from "lodash";
import BaseMemory from "./interface";

interface IGlobalMemory {}

export default class extends BaseMemory implements IGlobalMemory {
  private static type: MemoryTypes = "Global";

  static ValidateSingle(): boolean {
    return Memory.version !== undefined;
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

  static Delete(): CRUDResult<Memory> {
    forEach(Object.keys(Memory), (key: string) => {
      delete Memory[key];
    });
    return { success: true, data: undefined };
  }

  static Initialize(): CRUDResult<Memory> {
    const data = this.Generate();
    const result = this.Update(data);
    return { success: result.success, data: result.data };
  }
}
