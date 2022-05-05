import { forEach } from "lodash";
import BaseHeapData from "./interface";

export default class GlobalHeapData extends BaseHeapData {
  private type: HeapTypes = "Global";

  protected MinimumVersion(): number {
    return 0;
  }

  protected ValidateSingle(): boolean {
    return super.ValidateSingleHeap("", this.type);
  }

  /**
   * Create an new object of this type
   */
  protected Generate(): GlobalData {
    return {
      Version: 0,
      CreepsData: {},
      RoomsData: {},
      StructuresData: {},
    };
  }

  protected Get(): CRUDResult<GlobalData> {
    const data: GlobalData = {
      CreepsData: global.CreepsData,
      RoomsData: global.RoomsData,
      StructuresData: global.StructuresData,
      Version: global.Version,
    };
    return { success: !!data, data };
  }

  protected Update(data: GlobalData): CRUDResult<GlobalData> {
    forEach(data, (value: unknown, key: string) => {
      global[key] = value;
    });
    return { success: true, data };
  }

  protected Initialize(): boolean {
    return this.Update(this.Generate()).success;
  }
}
