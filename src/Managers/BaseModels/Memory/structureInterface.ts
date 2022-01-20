import { clone } from "lodash";
import BaseMemory from "./interface";

interface IStructureMemory {
  Validate(data: StringMap<StructureMemory>): ValidatedData;
  ValidateSingle(data: StructureMemory): boolean;
  Generate(): StructureMemory;
}

export default class extends BaseMemory implements IStructureMemory {
  private type: MemoryTypes = "Structure";

  Validate(data: StringMap<StructureMemory>): ValidatedData {
    return super.Validate(data, this.type);
  }

  ValidateSingle(data: StructureMemory): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  Generate(): StructureMemory {
    return {
      version: super.MinimumVersion(this.type),
      energyIncoming: {},
      energyOutgoing: {},
    };
  }

  static Get(id: string): CRUDResult<StructureMemory> {
    const data = clone(Memory.StructuresData.data[id]);
    return { success: !!data, data };
  }

  static Create(
    id: string,
    data: StructureMemory
  ): CRUDResult<StructureMemory> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(
    id: string,
    data: StructureMemory
  ): CRUDResult<StructureMemory> {
    Memory.StructuresData.data[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<StructureMemory> {
    delete Memory.StructuresData.data[id];
    return { success: true, data: undefined };
  }

  static GetAll(
    predicate?: Predicate<StructureMemory>
  ): StringMap<StructureMemory> {
    let { data } = Memory.StructuresData;
    data = super.GetAllData(data, predicate);
    return data;
  }
}
