import { clone } from "lodash";
import BaseCache from "./interface";

interface ICreepCache {}

export default class extends BaseCache implements ICreepCache {
  private static type: CacheTypes = "Creep";

  static Validate(data: StringMap<CreepCache>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: CreepCache): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(
    executer: string,
    body: BodyParts,
    pos: FreezedRoomPosition,
    type: CreepTypes
  ): CreepCache {
    return {
      version: super.MinimumVersion(this.type),
      executer,
      body,
      pos,
      type,
    };
  }

  static Get(id: string): CRUDResult<CreepCache> {
    const data = clone(Memory.CreepsData.cache[id]);
    return { success: !!data, data };
  }

  static Create(id: string, data: CreepCache): CRUDResult<CreepCache> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(id: string, data: CreepCache): CRUDResult<CreepCache> {
    Memory.CreepsData.cache[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<CreepCache> {
    delete Memory.CreepsData.cache[id];
    return { success: true, data: undefined };
  }

  static GetAll(
    executer: string,
    getOnlyExecuterJobs = true,
    roomsToCheck: string[] = [],
    predicate?: Predicate<CreepCache>
  ): StringMap<CreepCache> {
    let data = Memory.CreepsData.cache;
    data = super.GetAllData(
      data,
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
    body: BodyParts,
    pos: FreezedRoomPosition,
    type: CreepTypes
  ): CRUDResult<CreepCache> {
    const cache = this.Generate(executer, body, pos, type);
    const result = this.Create(id, cache);
    return { data: result.data, success: result.success };
  }
}
