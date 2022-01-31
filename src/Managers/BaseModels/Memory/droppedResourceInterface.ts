import { clone } from "lodash";
import BaseMemory from "./interface";

interface IDroppedResourcesMemory {}

export default class extends BaseMemory implements IDroppedResourcesMemory {
  private static type: MemoryTypes = "DroppedResource";

  static Validate(data: StringMap<DroppedResourceMemory>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: DroppedResourceMemory): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(): DroppedResourceMemory {
    return {
      version: super.MinimumVersion(this.type),
      energyOutgoing: {},
      energyIncoming: {},
    };
  }

  static Get(id: string): CRUDResult<DroppedResourceMemory> {
    const data = clone(Memory.DroppedResourceData.data[id]);
    if (data === undefined) return { success: false, data: undefined };
    return { success: this.ValidateSingle(data), data };
  }

  static Create(
    id: string,
    data: DroppedResourceMemory
  ): CRUDResult<DroppedResourceMemory> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(
    id: string,
    data: DroppedResourceMemory
  ): CRUDResult<DroppedResourceMemory> {
    Memory.DroppedResourceData.data[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<DroppedResourceMemory> {
    delete Memory.DroppedResourceData.data[id];
    return { success: true, data: undefined };
  }

  static GetAll(
    predicate?: Predicate<DroppedResourceMemory>
  ): StringMap<DroppedResourceMemory> {
    let { data } = Memory.DroppedResourceData;
    data = super.GetAllData(data, this.type, predicate);
    return data;
  }

  static Initialize(id: string): CRUDResult<DroppedResourceMemory> {
    const data = this.Generate();
    const result = this.Create(id, data);
    return { success: result.success, data: result.data };
  }
}
