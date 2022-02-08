import { clone } from "lodash";
import BaseMemory from "./interface";

interface IStructureMemory {}

export default class extends BaseMemory implements IStructureMemory {
  private static type: MemoryTypes = "Structure";

  static Validate(data: StringMap<StructureMemory>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: StructureMemory): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(isSource:boolean = false): StructureMemory {
    return {
      version: super.MinimumVersion(this.type),
      energyIncoming: {},
      energyOutgoing: {},
      isSourceStructure: isSource,
    };
  }

  static Get(id: string): CRUDResult<StructureMemory> {
    const data = clone(Memory.StructuresData.data[id]);
    if (data === undefined) return { success: false, data: undefined };
    return { success: this.ValidateSingle(data), data };
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
    data = super.GetAllData(data, this.type, predicate);
    return data;
  }

  static Initialize(id: string,isSource?:boolean): CRUDResult<StructureMemory> {
    const cache = this.Generate(isSource);
    const result = this.Create(id, cache);
    return { data: result.data, success: result.success };
  }
}
