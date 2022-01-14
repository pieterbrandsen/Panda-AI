import { clone } from "lodash";
import BaseHeap from "./interface";

interface IStructureHeap {
  ValidateSingle(id: string): boolean;
  Generate(): StructureHeap;
}

export default class extends BaseHeap implements IStructureHeap {
  private type: HeapTypes = "Structure";

  ValidateSingle(id:string): boolean {
    return super.ValidateSingle(id, this.type);
  }

  /**
   * Create an new object of this type
   */
  Generate(): StructureHeap {
    return {
    };
  }

  static Get(id: string): CRUDResult<StructureHeap> {
    const data = clone(global.StructuresData[id]);
    return { success: !!data, data };
  }

  static Create(
    id: string,
    data: StructureHeap
  ): CRUDResult<StructureHeap> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(
    id: string,
    data: StructureHeap
  ): CRUDResult<StructureHeap> {
    global.StructuresData[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<StructureHeap> {
    delete global.StructuresData[id];
    return { success: true, data: undefined };
  }
}
