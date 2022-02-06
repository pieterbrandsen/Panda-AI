import { clone, forEach } from "lodash";
import BaseMemory from "./interface";
import IStatsMemory from "./Stats/globalStats";
import ILogsMemory from "./logsInterface";

interface IGlobalMemory {}

export default class extends BaseMemory implements IGlobalMemory {
  static ValidateSingle(): boolean {
    let isValid = true;
    if (Memory.version === undefined) {
      isValid = false;
    }
    return isValid;
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
        DroppedResourceData: {
          ...defaultMainMemoryData,
          version: 0,
        },
      },
      ...defaultObject,
      updateCreepNames: [],
      stats: IStatsMemory.Generate(0),
      logs: ILogsMemory.Generate(0),
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

  static Delete(key?: string): CRUDResult<Memory> {
    if (key) {
      delete Memory[key];
      return { success: true, data: undefined };
    }
    forEach(Object.keys(Memory), (k: string) => {
      delete Memory[k];
    });
    return { success: true, data: undefined };
  }

  static Initialize(): CRUDResult<Memory> {
    this.Delete();
    const data = this.Generate();
    const result = this.Update(data);

    return { success: result.success, data: result.data };
  }
}