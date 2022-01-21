import { clone } from "lodash";
import BaseMemory from "./interface";

interface IJobCache {}

export default class extends BaseMemory implements IJobCache {
  private static type: CacheTypes = "Job";

  static Validate(data: StringMap<JobCache>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: JobCache): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(executer: string, type: JobTypes): JobCache {
    return {
      type,
      executer,
      version: super.MinimumVersion(this.type),
    };
  }

  static Get(id: string): CRUDResult<JobCache> {
    const data = clone(Memory.JobsData.cache[id]);
    return { success: !!data, data };
  }

  static Create(id: string, data: JobCache): CRUDResult<JobCache> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(id: string, data: JobCache): CRUDResult<JobCache> {
    Memory.JobsData.cache[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<JobCache> {
    delete Memory.JobsData.cache[id];
    return { success: true, data: undefined };
  }

  static GetAll(
    getOnlyExecuterJobs = true,
    executer?: string,
    roomsToCheck: string[] = [],
    predicate?: Predicate<JobCache>,
    predicate2?: Predicate<JobCache>
  ): StringMap<JobCache> {
    let data = Memory.JobsData.cache;
    data = super.GetAllData(
      data,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      predicate,
      predicate2
    );
    return data;
  }

  static Initialize(
    id: string,
    executer: string,
    type: JobTypes
  ): CRUDResult<JobCache> {
    const cache = this.Generate(executer, type);
    const result = this.Create(id, cache);
    return { data: result.data, success: result.success };
  }
}
