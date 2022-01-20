import { clone, filter, pickBy } from "lodash";
import BaseMemory from "./interface";
import Predicates from "./predicates";

interface IJobCache {
  Validate(data: StringMap<JobCache>): ValidatedData;
  ValidateSingle(data: JobCache): boolean;
  Generate(data:JobInitializationData): JobCache;
}

export default class extends BaseMemory implements IJobCache {
  private type: CacheTypes = "Job";

  Validate(data: StringMap<JobCache>): ValidatedData {
    return super.Validate(data, this.type);
  }

  ValidateSingle(data: JobCache): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  Generate(data: JobInitializationData) : JobCache {
    return {
      type:data.type,
        executer:data.executer ,
      version: super.MinimumVersion(this.type),
    };
  }

  static Get(id: string): CRUDResult<JobCache> {
    const data = clone(Memory.JobsData.cache[id]);
    return { success: !!data, data };
  }

  static Create(
    id: string,
    data: JobCache
  ): CRUDResult<JobCache> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(
    id: string,
    data: JobCache
  ): CRUDResult<JobCache> {
    Memory.JobsData.cache[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<JobCache> {
    delete Memory.JobsData.cache[id];
    return { success: true, data: undefined };
  }

  static GetAll(getOnlyExecuterJobs = true,executer?:string,predicate?: Predicate<JobCache>,predicate2?:Predicate<JobCache>): StringMap<JobCache> {
    let data =Memory.JobsData.cache;
    data= super.GetAllData(data,executer,getOnlyExecuterJobs,predicate,predicate2);
    return data;
  }
}
