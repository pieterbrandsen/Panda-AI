import { clone } from "lodash";
import BaseMemoryData from "./interface";

export default class CreepMemoryData extends BaseMemoryData {
  protected _id: string;

  constructor(id: string) {
    const memoryType: MemoryTypes = "Creep";
    super(memoryType);
    this._id = id;
  }

  protected ValidateMemoryData(data: StringMap<CreepMemory>): ValidatedData {
    return super.ValidateMemoryData(data);
  }

  protected ValidateSingleMemoryData(data: CreepMemory): boolean {
    return super.ValidateSingleMemoryData(data);
  }

  /**
   * Create an new object of this type
   */
  protected GenerateMemoryData(
    isRemoteCreep: boolean,
    name: string
  ): CreepMemory {
    return {
      version: super.MinimumMemoryVersion(),
      energyOutgoing: {},
      energyIncoming: {},
      isRemoteCreep,
      name,
    };
  }

  protected GetMemoryData(): CRUDResult<CreepMemory> {
    const data = clone(Memory.CreepsData.data[this._id]);
    return {
      success: data !== undefined ? this.ValidateSingleMemoryData(data) : false,
      data,
    };
  }

  protected CreateMemoryData(data: CreepMemory): CRUDResult<CreepMemory> {
    let getResult = this.GetMemoryData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateMemoryData(data);
    getResult = this.GetMemoryData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  protected UpdateMemoryData(data: CreepMemory): CRUDResult<CreepMemory> {
    Memory.CreepsData.data[this._id] = data;
    return { success: Memory.CreepsData.data[this._id] !== undefined, data };
  }

  protected DeleteMemoryData(): CRUDResult<CreepMemory> {
    delete Memory.CreepsData.data[this._id];
    return {
      success: Memory.CreepsData.data[this._id] === undefined,
      data: undefined,
    };
  }

  protected static GetAllMemoryData(
    type: MemoryTypes,
    predicate?: Predicate<CreepMemory>
  ): StringMap<CreepMemory> {
    let { data } = Memory.CreepsData;
    data = super.GetAllMemoryDataFilter(type, data, predicate);
    return data;
  }

  protected InitializeMemoryData(
    name: string,
    isRemoteCreep: boolean
  ): CRUDResult<CreepMemory> {
    const data = this.GenerateMemoryData(isRemoteCreep, name);
    const createResult = this.CreateMemoryData(data);
    return { success: createResult.success, data: createResult.data };
  }
}
