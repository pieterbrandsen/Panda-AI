import { clone } from "lodash";
import BaseHeapData from "./interface";

export default class CreepHeapData extends BaseHeapData {
  protected _id: string;

  constructor(id: string, heapType: HeapTypes) {
    super(heapType);
    this._id = id;
  }

  public ValidateSingleHeapData(): boolean {
    return super.ValidateSingleHeapData(this._id);
  }

  /**
   * Create an new object of this type
   */
  public static GenerateHeapData(): CreepHeap {
    return {};
  }

  public GetHeapData(): CRUDResult<CreepHeap> {
    const data = clone(global.CreepsData[this._id]);
    return { success: this.ValidateSingleHeapData(), data };
  }

  public CreateHeapData(data: CreepHeap): CRUDResult<CreepHeap> {
    let getResult = this.GetHeapData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateHeapData(data);
    getResult = this.GetHeapData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  public UpdateHeapData(data: CreepHeap): CRUDResult<CreepHeap> {
    global.CreepsData[this._id] = data;
    return { success: this.ValidateSingleHeapData(), data };
  }

  public DeleteHeapData(): CRUDResult<CreepHeap> {
    delete global.CreepsData[this._id];
    return { success: !this.ValidateSingleHeapData(), data: undefined };
  }

  public InitializeHeapData(): CRUDResult<CreepHeap> {
    const data = CreepHeapData.GenerateHeapData();
    const createResult = this.CreateHeapData(data);
    return { success: createResult.success, data: createResult.data };
  }
}
