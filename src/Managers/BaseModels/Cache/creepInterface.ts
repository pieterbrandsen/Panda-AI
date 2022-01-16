import { clone, pickBy } from "lodash";
import BaseCache from "./interface";
import Predicates from "./predicates";

interface ICreepCache {
  Validate(data: StringMap<CreepCache>): ValidatedData;
  ValidateSingle(data: CreepCache): boolean;
  Generate(executer:string): CreepCache;
}

export default class extends BaseCache implements ICreepCache {
  private type: CacheTypes = "Creep";

  Validate(data: StringMap<CreepCache>): ValidatedData {
    return super.Validate(data, this.type);
  }

  ValidateSingle(data: CreepCache): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  Generate(executer:string): CreepCache {
    return {
      version: super.MinimumVersion(this.type),
executer
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

  static GetAll(executer:string,getOnlyExecuterJobs = true,predicate?: Predicate<JobCache>): StringMap<JobCache> {
    let data =Memory.CreepsData.cache;
    data= super.GetAllData(data,executer,getOnlyExecuterJobs,predicate);
    return data;
  }
}
