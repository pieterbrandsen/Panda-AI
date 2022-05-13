import { clone } from "lodash";
import BaseHeapData from "./interface";

export default class StructureHeapData extends BaseHeapData {
  public _id: string;

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
  public static GenerateHeapData(): StructureHeap {
    return {};
  }

  public GetHeapData(): CRUDResult<StructureHeap> {
    const data = clone(global.StructuresData[this._id]);
    return { success: this.ValidateSingleHeapData(), data };
  }

  public CreateHeapData(data: StructureHeap): CRUDResult<StructureHeap> {
    let getResult = this.GetHeapData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateHeapData(data);
    getResult = this.GetHeapData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  public UpdateHeapData(data: StructureHeap): CRUDResult<StructureHeap> {
    global.StructuresData[this._id] = data;
    return { success: this.ValidateSingleHeapData(), data };
  }

  public DeleteHeapData(): CRUDResult<StructureHeap> {
    delete global.StructuresData[this._id];
    return { success: !this.ValidateSingleHeapData(), data: undefined };
  }

  public InitializeHeapData(): CRUDResult<StructureHeap> {
    const data = StructureHeapData.GenerateHeapData();
    const createResult = this.CreateHeapData(data);
    return { success: createResult.success, data: createResult.data };
  }
}
