import { clone } from "lodash";
import BaseCacheData from "./interface";

export default class RoomCacheData extends BaseCacheData {
  private static type: CacheTypes = "Room";

  static Validate(data: StringMap<RoomCache>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: RoomCache): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(): RoomCache {
    return {
      version: super.MinimumVersion(this.type),
      executer: "",
    };
  }

  static Get(id: string): CRUDResult<RoomCache> {
    const data = clone(Memory.RoomsData.cache[id]);
    if (data === undefined) return { success: false, data: undefined };
    return { success: this.ValidateSingle(data), data };
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

  static GetAll(
    executer = "",
    getOnlyExecuterJobs = true,
    roomsToCheck: string[] = [],
    predicate?: Predicate<RoomCache>
  ): StringMap<RoomCache> {
    let data = Memory.RoomsData.cache;
    data = super.GetAllData(
      data,
      this.type,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      predicate
    );
    return data;
  }

  static Initialize(id: string): CRUDResult<RoomCache> {
    const cache = this.Generate();
    const result = this.Create(id, cache);
    return { data: result.data, success: result.success };
  }
}
