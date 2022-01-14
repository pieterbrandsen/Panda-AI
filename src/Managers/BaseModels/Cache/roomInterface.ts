import { clone, pickBy } from "lodash";
import BaseCache from "./interface";

interface IRoomCache {
  Validate(data: StringMap<RoomCache>): ValidatedData;
  ValidateSingle(data: RoomCache): boolean;
  Generate(): RoomCache;
}

export default class extends BaseCache implements IRoomCache {
  private memoryType: MemoryTypes = "Room";

  Validate(data: StringMap<RoomCache>): ValidatedData {
    return super.Validate(data, this.memoryType);
  }

  ValidateSingle(data: RoomCache): boolean {
    return super.ValidateSingle(data, this.memoryType);
  }

  /**
   * Create an new object of this type
   */
  Generate(): RoomCache {
    return {
      version: super.MinimumVersion(this.memoryType),
    };
  }

  static Get(id: string): CRUDResult<RoomCache> {
    const data = clone(Memory.RoomsData.cache[id]);
    return { success: !!data, data };
  }

  static Create(id: string, data: RoomCache): CRUDResult<RoomCache> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(id: string, data: RoomCache): CRUDResult<RoomCache> {
    Memory.RoomsData.cache[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<RoomCache> {
    delete Memory.RoomsData.cache[id];
    return { success: true, data: undefined };
  }

  static GetAll(predicate?: Predicate<RoomCache>): StringMap<RoomCache> {
    const data = Memory.RoomsData.cache;
    if (!predicate) {
      return data;
    }

    return pickBy(data,predicate);
  }
}
