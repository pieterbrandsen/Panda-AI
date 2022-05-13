import { clone } from "lodash";
import BaseHeapData from "./interface";

export default class StructureHeapData extends BaseHeapData {
  protected _id: string;

  constructor(id: string) {
    const heapType: HeapTypes = "Structure";
    super(heapType);
    this._id = id;
  }

  protected ValidateSingleHeapData(): boolean {
    return super.ValidateSingleHeapData(this._id);
  }

  /**
   * Create an new object of this type
   */
  protected GenerateHeapData(): StructureHeap {
    return {};
  }

  protected GetHeapData(): CRUDResult<StructureHeap> {
    const data = clone(global.StructuresData[this._id]);
    return { success: this.ValidateSingleHeapData(), data };
  }

  protected CreateHeapData(data: StructureHeap): CRUDResult<StructureHeap> {
    let getResult = this.GetHeapData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateHeapData(data);
    getResult = this.GetHeapData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  protected UpdateHeapData(data: StructureHeap): CRUDResult<StructureHeap> {
    global.StructuresData[this._id] = data;
    return { success: this.ValidateSingleHeapData(), data };
  }

  protected DeleteHeapData(): CRUDResult<StructureHeap> {
    delete global.StructuresData[this._id];
    return { success: !this.ValidateSingleHeapData(), data: undefined };
  }

  protected InitializeHeapData(): CRUDResult<StructureHeap> {
    const data = this.GenerateHeapData();
    const createResult = this.CreateHeapData(data);
    return { success: createResult.success, data: createResult.data };
  }
}
