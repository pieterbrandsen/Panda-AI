import { clone } from "lodash";
import BaseHeapData from "./interface";

export default class StructureHeapData extends BaseHeapData {
    private _id: string;
    constructor(id: string) {
      super();
      this._id = id;
    }

  private type: HeapTypes = "Structure";

  protected ValidateSingleHeap(): boolean {
    return super.ValidateSingle(this._id, this.type);
  }

  /**
   * Create an new object of this type
   */
   protected GenerateHeap(): StructureHeap {
    return {};
  }

  protected GetHeap(): CRUDResult<StructureHeap> {
    const data = clone(global.StructuresData[this._id]);
    return { success: !!data, data };
  }

  protected CreateHeap(data: StructureHeap): CRUDResult<StructureHeap> {
    const dataAtId = this.GetHeap();
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.UpdateHeap(data);
    return { success: result.success, data: clone(result.data) };
  }

  protected UpdateHeap(data: StructureHeap): CRUDResult<StructureHeap> {
    global.StructuresData[this._id] = data;
    return { success: true, data };
  }

  protected DeleteHeap(): CRUDResult<StructureHeap> {
    delete global.StructuresData[this._id];
    return { success: true, data: undefined };
  }

  protected InitializeHeap(): CRUDResult<StructureHeap> {
    const data = this.GenerateHeap();
    const result = this.CreateHeap(data);
    return { success: result.success, data: result.data };
  }
}
