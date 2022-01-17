import { clone, pickBy } from "lodash";
import BaseCache from "./interface";

interface IRoomCache {
  Validate(data: StringMap<RoomCache>): ValidatedData;
  ValidateSingle(data: RoomCache): boolean;
  Generate(): RoomCache;
}

export default class extends BaseCache implements IRoomCache {
  private type: CacheTypes = "Room";

  Validate(data: StringMap<RoomCache>): ValidatedData {
    return super.Validate(data, this.type);
  }

  ValidateSingle(data: RoomCache): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  Generate(): RoomCache {
    return {
      version: super.MinimumVersion(this.type),
      executer: "",
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

  static GetAll(executer:string,getOnlyExecuterJobs = true,predicate?: Predicate<RoomCache>): StringMap<RoomCache> {
    let data =Memory.RoomsData.cache;
    data= super.GetAllData(data,executer,getOnlyExecuterJobs,predicate);
    return data;
  }
}
