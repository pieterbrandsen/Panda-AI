import { clone, forEach } from "lodash";
import BaseMemoryData from "./interface";
import StatsMemoryData from "./Stats/global";
import LogsMemoryData from "./logs";

export default class GlobalMemoryData extends BaseMemoryData {
  protected static ValidateSingleMemoryData(): boolean {
    let isValid = true;
    if (Memory.version === undefined) {
      isValid = false;
    }
    return isValid;
  }

  /**
   * Create an new object of this type
   */
  protected static GenerateMemoryData(): Memory {
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
      stats: new StatsMemoryData().GenerateMemoryData(0),
      logs: new LogsMemoryData().GenerateMemoryData(0),
    };
  }

  protected static GetMemoryData(): CRUDResult<Memory> {
    const data = clone(Memory);
    return {
      success: data !== undefined ? this.ValidateSingleMemoryData() : false,
      data,
    };
  }

  protected static UpdateMemoryData(data: Memory): CRUDResult<Memory> {
    forEach(data, (value: unknown, key: string) => {
      Memory[key] = value;
    });
    return { success: true, data };
  }

  protected static DeleteMemoryData(key?: string): CRUDResult<Memory> {
    if (key) {
      delete Memory[key];
      return { success: true, data: undefined };
    }
    forEach(Object.keys(Memory), (k: string) => {
      delete Memory[k];
    });
    return { success: true, data: undefined };
  }

  protected static InitializeMemoryData(): CRUDResult<Memory> {
    this.DeleteMemoryData();
    const data = this.GenerateMemoryData();
    const updateResult = this.UpdateMemoryData(data);
    return { success: updateResult.success, data: updateResult.data };
  }
}
