import { clone } from "lodash";
import BaseMemory from "./interface";

interface ICreepMemory {}

export default class extends BaseMemory implements ICreepMemory {
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
  static Generate(isRemoteCreep: boolean): CreepMemory {
    return {
      version: super.MinimumVersion(this.type),
      energyOutgoing: {},
      energyIncoming: {},
      isRemoteCreep,
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
    delete Memory.creeps[id];
    return { success: true, data: undefined };
  }

  static GetAll(predicate?: Predicate<CreepMemory>): StringMap<CreepMemory> {
    let { data } = Memory.CreepsData;
    data = super.GetAllData(data, this.type,  predicate);
    return data;
  }

  static Initialize(
    id: string,
    isRemoteCreep: boolean
  ): CRUDResult<CreepMemory> {
    const data = this.Generate(isRemoteCreep);
    const result = this.Create(id, data);
    return { success: result.success, data: result.data };
  }
}
