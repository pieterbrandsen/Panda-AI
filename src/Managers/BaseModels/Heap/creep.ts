import { clone } from "lodash";
import BaseHeapData from "./interface";

export default class CreepHeapData extends BaseHeapData {
  private type: HeapTypes = "Creep";

  private _id: string;

  constructor(id: string) {
    super();
    this._id = id;
  }

  protected ValidateSingleHeap(): boolean {
    return super.ValidateSingleHeap(this._id, this.type);
  }

  /**
   * Create an new object of this type
   */
  protected GenerateHeap(): CreepHeap {
    return {};
  }

  protected GetHeap(): CRUDResult<CreepHeap> {
    const data = clone(global.CreepsData[this._id]);
    return { success: !!data, data };
  }

  protected CreateHeap(data: CreepHeap): CRUDResult<CreepHeap> {
    const dataAtId = this.GetHeap();
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.UpdateHeap(data);
    return { success: result.success, data: clone(result.data) };
  }

  protected UpdateHeap(data: CreepHeap): CRUDResult<CreepHeap> {
    global.CreepsData[this._id] = data;
    return { success: true, data };
  }

  protected DeleteHeap(): CRUDResult<CreepHeap> {
    delete global.CreepsData[this._id];
    return { success: true, data: undefined };
  }

  protected InitializeHeap(): CRUDResult<CreepHeap> {
    const data = this.GenerateHeap();
    const result = this.CreateHeap(data);
    return { success: result.success, data: result.data };
  }
}
