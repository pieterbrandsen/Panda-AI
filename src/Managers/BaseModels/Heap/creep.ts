import { clone } from "lodash";
import BaseHeapData from "./interface";

export default class CreepHeapData extends BaseHeapData {
  private static type: HeapTypes = "Creep";

  static ValidateSingle(id: string): boolean {
    return super.ValidateSingle(id, this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(): CreepHeap {
    return {};
  }

  static Get(id: string): CRUDResult<CreepHeap> {
    const data = clone(global.CreepsData[id]);
    return { success: !!data, data };
  }

  static Create(id: string, data: CreepHeap): CRUDResult<CreepHeap> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(id: string, data: CreepHeap): CRUDResult<CreepHeap> {
    global.CreepsData[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<CreepHeap> {
    delete global.CreepsData[id];
    return { success: true, data: undefined };
  }

  static Initialize(id: string): CRUDResult<CreepHeap> {
    const data = this.Generate();
    const result = this.Create(id, data);
    return { success: result.success, data: result.data };
  }
}
