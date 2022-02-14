import { clone } from "lodash";
import BaseMemoryData from "./interface";

export default class CreepMemoryData extends BaseMemoryData {
  private static type: MemoryTypes = "Creep";

  static Validate(data: StringMap<CreepMemory>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: CreepMemory): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(isRemoteCreep: boolean, name: string): CreepMemory {
    return {
      version: super.MinimumVersion(this.type),
      energyOutgoing: {},
      energyIncoming: {},
      isRemoteCreep,
      name,
    };
  }

  static Get(id: string): CRUDResult<CreepMemory> {
    const data = clone(Memory.CreepsData.data[id]);
    if (data === undefined) return { success: false, data: undefined };
    return { success: this.ValidateSingle(data), data };
  }

  static Create(id: string, data: CreepMemory): CRUDResult<CreepMemory> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(id: string, data: CreepMemory): CRUDResult<CreepMemory> {
    Memory.CreepsData.data[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<CreepMemory> {
    delete Memory.CreepsData.data[id];
    return { success: true, data: undefined };
  }

  static GetAll(predicate?: Predicate<CreepMemory>): StringMap<CreepMemory> {
    let { data } = Memory.CreepsData;
    data = super.GetAllData(data, this.type, predicate);
    return data;
  }

  static Initialize(
    id: string,
    name: string,
    isRemoteCreep: boolean
  ): CRUDResult<CreepMemory> {
    const data = this.Generate(isRemoteCreep, name);
    const result = this.Create(id, data);
    return { success: result.success, data: result.data };
  }
}
