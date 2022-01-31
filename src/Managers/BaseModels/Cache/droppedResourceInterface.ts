import { clone } from "lodash";
import BaseCache from "./interface";

interface IDroppedResourceCache {}

export default class extends BaseCache implements IDroppedResourceCache {
  private static type: CacheTypes = "DroppedResource";

  static Validate(data: StringMap<DroppedResourceCache>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: DroppedResourceCache): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(
    executer: string,
    pos: FreezedRoomPosition,
    type: ResourceConstant
  ): DroppedResourceCache {
    return {
      version: super.MinimumVersion(this.type),
      executer,
      pos,
      type,
    };
  }

  static Get(id: string): CRUDResult<DroppedResourceCache> {
    const data = clone(Memory.DroppedResourceData.cache[id]);
    if (data === undefined) return { success: false, data: undefined };
    return { success: this.ValidateSingle(data), data };
  }

  static Create(
    id: string,
    data: DroppedResourceCache
  ): CRUDResult<DroppedResourceCache> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(
    id: string,
    data: DroppedResourceCache
  ): CRUDResult<DroppedResourceCache> {
    Memory.DroppedResourceData.cache[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<DroppedResourceCache> {
    delete Memory.DroppedResourceData.cache[id];
    return { success: true, data: undefined };
  }

  static GetAll(
    executer: string,
    getOnlyExecuterJobs = true,
    roomsToCheck: string[] = [],
    predicate?: Predicate<DroppedResourceCache>
  ): StringMap<DroppedResourceCache> {
    let data = Memory.DroppedResourceData.cache;
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

  static Initialize(
    id: string,
    executer: string,
    pos: FreezedRoomPosition,
    type: ResourceConstant
  ): CRUDResult<DroppedResourceCache> {
    const cache = this.Generate(executer, pos, type);
    const result = this.Create(id, cache);
    return { data: result.data, success: result.success };
  }
}
