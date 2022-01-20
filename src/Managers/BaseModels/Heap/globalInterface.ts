import { forEach } from "lodash";
import BaseHeap from "./interface";

interface IGlobalHeap {}

export default class extends BaseHeap implements IGlobalHeap {
  private static type: HeapTypes = "Global";

  static MinimumVersion(): number {
    return 0;
  }

  static ValidateSingle(): boolean {
    return super.ValidateSingle("", this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(): GlobalData {
    return {
      Version: 0,
      CreepsData: {},
      RoomsData: {},
      StructuresData: {},
    };
  }

  static Get(): CRUDResult<GlobalData> {
    const data: GlobalData = {
      CreepsData: global.CreepsData,
      RoomsData: global.RoomsData,
      StructuresData: global.StructuresData,
      Version: global.Version,
    };
    return { success: !!data, data };
  }

  static Update(data: GlobalData): CRUDResult<GlobalData> {
    forEach(data, (value: unknown, key: string) => {
      global[key] = value;
    });
    return { success: true, data };
  }

  static Initialize(): boolean {
    return this.Update(this.Generate()).success;
  }
}
