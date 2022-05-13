import { clone } from "lodash";
import BaseMemoryData from "./interface";

export default class StructureMemoryData extends BaseMemoryData {
  protected _id: string;

  constructor(id: string) {
    const memoryType: MemoryTypes = "Structure";
    super(memoryType);
    this._id = id;
  }

  protected ValidateMemoryData(
    data: StringMap<StructureMemory>
  ): ValidatedData {
    return super.ValidateMemoryData(data);
  }

  protected ValidateSingleMemoryData(data: StructureMemory): boolean {
    return super.ValidateSingleMemoryData(data);
  }

  /**
   * Create an new object of this type
   */
  protected GenerateMemoryData(isSource = false): StructureMemory {
    return {
      version: super.MinimumMemoryVersion(),
      energyIncoming: {},
      energyOutgoing: {},
      isSourceStructure: isSource,
    };
  }

  protected GetMemoryData(): CRUDResult<StructureMemory> {
    const data = clone(Memory.StructuresData.data[this._id]);
    return {
      success: data !== undefined ? this.ValidateSingleMemoryData(data) : false,
      data,
    };
  }

  protected CreateMemoryData(
    data: StructureMemory
  ): CRUDResult<StructureMemory> {
    let getResult = this.GetMemoryData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateMemoryData(data);
    getResult = this.GetMemoryData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  protected UpdateMemoryData(
    data: StructureMemory
  ): CRUDResult<StructureMemory> {
    Memory.StructuresData.data[this._id] = data;
    return {
      success: Memory.StructuresData.data[this._id] !== undefined,
      data,
    };
  }

  protected DeleteMemoryData(): CRUDResult<StructureMemory> {
    delete Memory.StructuresData.data[this._id];
    return {
      success: Memory.StructuresData.data[this._id] === undefined,
      data: undefined,
    };
  }

  protected static GetAllMemoryData(
    type: MemoryTypes,
    predicate?: Predicate<StructureMemory>
  ): StringMap<StructureMemory> {
    let { data } = Memory.StructuresData;
    data = super.GetAllMemoryDataFilter(type, data, predicate);
    return data;
  }

  protected InitializeMemoryData(
    isSource?: boolean
  ): CRUDResult<StructureMemory> {
    const cache = this.GenerateMemoryData(isSource);
    const createResult = this.CreateMemoryData(cache);
    return { data: createResult.data, success: createResult.success };
  }
}
