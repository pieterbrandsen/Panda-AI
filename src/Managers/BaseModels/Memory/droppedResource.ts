import { clone } from "lodash";
import BaseMemoryData from "./interface";

export default class DroppedResourcesMemoryData extends BaseMemoryData {
  protected _id: string;
  constructor(id:string) {
    const memoryType: MemoryTypes = "DroppedResource";
    super(memoryType);
    this._id = id;
  }

  protected ValidateMemoryData(data: StringMap<DroppedResourceMemory>): ValidatedData {
    return super.ValidateMemoryData(data);
  }

  protected ValidateSingleMemoryData(data: DroppedResourceMemory): boolean {
    return super.ValidateSingleMemoryData(data);
  }

  /**
   * Create an new object of this type
   */
  protected GenerateMemoryData(): DroppedResourceMemory {
    return {
      version: super.MinimumMemoryVersion(),
      energyOutgoing: {},
      energyIncoming: {},
    };
  }

  protected GetMemoryData(): CRUDResult<DroppedResourceMemory> {
    const data = clone(Memory.DroppedResourceData.data[this._id]);
    return { success: data !== undefined ? this.ValidateSingleMemoryData(data) : false, data };
  }

  protected CreateMemoryData(
    data: DroppedResourceMemory
  ): CRUDResult<DroppedResourceMemory> {
    let getResult = this.GetMemoryData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateMemoryData(data);
    getResult = this.GetMemoryData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  protected UpdateMemoryData(
    data: DroppedResourceMemory
  ): CRUDResult<DroppedResourceMemory> {
    Memory.DroppedResourceData.data[this._id] = data;
    return { success: Memory.DroppedResourceData.data[this._id] !== undefined, data };
  }

  protected DeleteMemoryData(): CRUDResult<DroppedResourceMemory> {
    delete Memory.DroppedResourceData.data[this._id];
    return { success: Memory.DroppedResourceData.data[this._id] === undefined, data: undefined };
  }

  public static GetAllMemoryData(type:MemoryTypes,
    predicate?: Predicate<DroppedResourceMemory>
  ): StringMap<DroppedResourceMemory> {
    let { data } = Memory.DroppedResourceData;
    data = super.GetAllMemoryDataFilter(type,data, predicate);
    return data;
  }

  protected InitializeMemoryData(): CRUDResult<DroppedResourceMemory> {
    const data = this.GenerateMemoryData();
    const createResult = this.CreateMemoryData(data);
    return { success: createResult.success, data: createResult.data };
  }
}
