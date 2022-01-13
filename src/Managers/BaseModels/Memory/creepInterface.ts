import { clone } from "lodash";
import BaseMemory from "./interface";

interface ICreepMemory {
  Validate(data: StringMap<CreepMemory>): ValidatedMemory;
  ValidateSingle(data: CreepMemory): boolean;
  Generate(): CreepMemory;
}

export default class extends BaseMemory implements ICreepMemory {
  private memoryType: MemoryTypes = "Creep";

  Validate(data: StringMap<CreepMemory>): ValidatedMemory {
    return super.Validate(data, this.memoryType);
  }

  ValidateSingle(data: CreepMemory): boolean {
    return super.ValidateSingle(data, this.memoryType);
  }

  /**
   * Create an new object of this type
   */
  Generate(): CreepMemory {
    return {
      version: super.MinimumMemoryVersion(this.memoryType),
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
}
