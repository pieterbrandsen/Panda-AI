import { clone, filter, pickBy } from "lodash";
import BaseMemory from "./interface";
import Predicates from "./predicates";

interface IStructureCache {
  Validate(data: StringMap<StructureCache>): ValidatedData;
  ValidateSingle(data: StructureCache): boolean;
  Generate(structure:Structure): StructureCache;
}

export default class extends BaseMemory implements IStructureCache {
  private memoryType: MemoryTypes = "Structure";

  Validate(data: StringMap<StructureCache>): ValidatedData {
    return super.Validate(data, this.memoryType);
  }

  ValidateSingle(data: StructureCache): boolean {
    return super.ValidateSingle(data, this.memoryType);
  }

  /**
   * Create an new object of this type
   */
  Generate(structure:Structure): StructureCache {
    return {
      type: structure.structureType,
      version: super.MinimumVersion(this.memoryType),
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

  static GetAll(predicate?: Predicate<StructureCache>): StringMap<StructureCache> {
    const data = Memory.StructuresData.cache;
    if (!predicate) {
      return data;
    }

    return pickBy(data,predicate);
  }
}
