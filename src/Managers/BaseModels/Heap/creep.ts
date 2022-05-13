import { clone } from "lodash";
import BaseHeapData from "./interface";

export default class CreepHeapData extends BaseHeapData {
  protected _id: string;

  constructor(id: string) {
    const heapType: HeapTypes = "Creep";
    super(heapType);
    this._id = id;
  }

  protected ValidateSingleHeapData(): boolean {
    return super.ValidateSingleHeapData(this._id);
  }

  /**
   * Create an new object of this type
   */
  protected static GenerateHeapData(): CreepHeap {
    return {};
  }

  protected GetHeapData(): CRUDResult<CreepHeap> {
    const data = clone(global.CreepsData[this._id]);
    return { success: this.ValidateSingleHeapData(), data };
  }

  protected CreateHeapData(data: CreepHeap): CRUDResult<CreepHeap> {
    let getResult = this.GetHeapData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateHeapData(data);
    getResult = this.GetHeapData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  protected UpdateHeapData(data: CreepHeap): CRUDResult<CreepHeap> {
    global.CreepsData[this._id] = data;
    return { success: this.ValidateSingleHeapData(), data };
  }

  protected DeleteHeapData(): CRUDResult<CreepHeap> {
    delete global.CreepsData[this._id];
    return { success: !this.ValidateSingleHeapData(), data: undefined };
  }

  protected InitializeHeapData(): CRUDResult<CreepHeap> {
    const data = CreepHeapData.GenerateHeapData();
    const createResult = this.CreateHeapData(data);
    return { success: createResult.success, data: createResult.data };
  }
}
