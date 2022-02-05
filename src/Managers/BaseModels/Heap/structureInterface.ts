import { clone } from "lodash";
import BaseHeap from "./interface";

interface IStructureHeap {}

export default class extends BaseHeap implements IStructureHeap {
  private static type: HeapTypes = "Structure";

  static ValidateSingle(id: string): boolean {
    return super.ValidateSingle(id, this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(): StructureHeap {
    return {};
  }

  static Get(id: string): CRUDResult<StructureHeap> {
    const data = clone(global.StructuresData[id]);
    return { success: !!data, data };
  }

  static Create(id: string, data: StructureHeap): CRUDResult<StructureHeap> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(id: string, data: StructureHeap): CRUDResult<StructureHeap> {
    global.StructuresData[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<StructureHeap> {
    delete global.StructuresData[id];
    return { success: true, data: undefined };
  }

  static Initialize(id: string): CRUDResult<StructureHeap> {
    const data = this.Generate();
    const result = this.Create(id, data);
    return { success: result.success, data: result.data };
  }
}
