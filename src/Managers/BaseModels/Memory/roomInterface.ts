import { clone } from "lodash";
import BaseMemory from "./interface";

interface IRoomMemory {
  Validate(data: StringMap<RoomMemory>): ValidatedMemory;
  ValidateSingle(data: RoomMemory): boolean;
  Generate(): RoomMemory;
}

export default class extends BaseMemory implements IRoomMemory {
  private memoryType: MemoryTypes = "Room";

  Validate(data: StringMap<RoomMemory>): ValidatedMemory {
    return super.Validate(data, this.memoryType);
  }

  ValidateSingle(data: RoomMemory): boolean {
    return super.ValidateSingle(data, this.memoryType);
  }

  /**
   * Create an new object of this type
   */
  Generate(): RoomMemory {
    return {
      version: super.MinimumMemoryVersion(this.memoryType),
    };
  }

  static Get(id: string): CRUDResult<RoomMemory> {
    const data = clone(Memory.RoomsData.data[id]);
    return { success: !!data, data };
  }

  static Create(id: string, data: RoomMemory): CRUDResult<RoomMemory> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(id: string, data: RoomMemory): CRUDResult<RoomMemory> {
    Memory.RoomsData.data[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<RoomMemory> {
    delete Memory.RoomsData.data[id];
    return { success: true, data: undefined };
  }
}
