import { clone } from "lodash";
import BaseMemory from "./interface";

interface ICreepMemory {
  Validate(data: StringMap<CreepMemory>): ValidatedData;
  ValidateSingle(data: CreepMemory): boolean;
  Generate(type: CreepTypes): CreepMemory;
}

export default class extends BaseMemory implements ICreepMemory {
  private type: MemoryTypes = "Creep";

  Validate(data: StringMap<CreepMemory>): ValidatedData {
    return super.Validate(data, this.type);
  }

  ValidateSingle(data: CreepMemory): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  Generate(): CreepMemory {
    return {
      version: super.MinimumVersion(this.type),
      energyIncoming: {},
      energyOutgoing: {},
    };
  }

  static Get(id: string): CRUDResult<CreepMemory> {
    const data = clone(Memory.CreepsData.data[id]);
    return { success: !!data, data };
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
    data = super.GetAllData(data, predicate);
    return data;
  }
}
