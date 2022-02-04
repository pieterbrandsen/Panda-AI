import { clone } from "lodash";
import BaseHeap from "./interface";

interface IRoomHeap {}

export default class extends BaseHeap implements IRoomHeap {
  private static type: HeapTypes = "Room";

  static ValidateSingle(id: string): boolean {
    return super.ValidateSingle(id, this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(): RoomHeap {
    return {};
  }

  static Get(id: string): CRUDResult<RoomHeap> {
    const data = clone(global.RoomsData[id]);
    return { success: !!data, data };
  }

  static Create(id: string, data: RoomHeap): CRUDResult<RoomHeap> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(id: string, data: RoomHeap): CRUDResult<RoomHeap> {
    global.RoomsData[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<RoomHeap> {
    delete global.RoomsData[id];
    return { success: true, data: undefined };
  }
}
