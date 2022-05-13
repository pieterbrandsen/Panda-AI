import { clone, forEach } from "lodash";
import BaseHeapData from "./interface";

export default class GlobalHeapData extends BaseHeapData {
  public static MinimumVersionHeapData(): number {
    return 0;
  }

  /**
   * Create an new object of this type
   */
  public static GenerateHeapData(): GlobalData {
    return {
      Version: 0,
      CreepsData: {},
      RoomsData: {},
      StructuresData: {},
    };
  }

  public GetHeapData(): CRUDResult<GlobalData> {
    const data: GlobalData = clone({
      CreepsData: global.CreepsData,
      RoomsData: global.RoomsData,
      StructuresData: global.StructuresData,
      Version: global.Version,
    });
    return { success: super.ValidateSingleHeapData(""), data };
  }

  public static UpdateHeapData(data: GlobalData): CRUDResult<GlobalData> {
    forEach(data, (value: unknown, key: string) => {
      global[key] = value;
    });
    return { success: true, data };
  }

  public static InitializeHeapData(): boolean {
    return GlobalHeapData.UpdateHeapData(GlobalHeapData.GenerateHeapData())
      .success;
  }
}
