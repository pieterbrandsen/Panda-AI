import { clone, filter, pickBy } from "lodash";
import BaseMemory from "./interface";
import Predicates from "./predicates";
import IRoomHelper from "../Helper/roomInterface";

interface IStructureCache {
  Validate(data: StringMap<StructureCache>): ValidatedData;
  ValidateSingle(data: StructureCache): boolean;
  Generate(structure:Structure,executer:string): StructureCache;
}

export default class extends BaseMemory implements IStructureCache {
  private type: CacheTypes = "Structure";

  Validate(data: StringMap<StructureCache>): ValidatedData {
    return super.Validate(data, this.type);
  }

  ValidateSingle(data: StructureCache): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  Generate(structure:Structure,executer:string): StructureCache {
    return {
      type: structure.structureType,
      version: super.MinimumVersion(this.type),
      executer,
      pos: IRoomHelper.FreezeRoomPosition(structure.pos)
    };
  }

  static Get(id: string): CRUDResult<StructureCache> {
    const data = clone(Memory.StructuresData.cache[id]);
    return { success: !!data, data };
  }

  static Create(
    id: string,
    data: StructureCache
  ): CRUDResult<StructureCache> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(
    id: string,
    data: StructureCache
  ): CRUDResult<StructureCache> {
    Memory.StructuresData.cache[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<StructureCache> {
    delete Memory.StructuresData.cache[id];
    return { success: true, data: undefined };
  }

  static GetAll(executer:string,getOnlyExecuterJobs = true,roomsToCheck:string[]=[],predicate?: Predicate<StructureCache>): StringMap<StructureCache> {
    let data =Memory.StructuresData.cache;
    data= super.GetAllData(data,executer,getOnlyExecuterJobs,roomsToCheck,predicate);
    return data;
  }
}
