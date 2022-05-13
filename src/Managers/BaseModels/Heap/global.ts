import { clone, forEach } from "lodash";
import BaseHeapData from "./interface";

export default class GlobalHeapData extends BaseHeapData {
  constructor() {
    const heapType: HeapTypes = "Global";
    super(heapType);
  }

  public MinimumVersionHeapData(): number {
    return 0;
  }

  public ValidateSingleHeapData(): boolean {
    return super.ValidateSingleHeapData("");
  }

  /**
   * Create an new object of this type
   */
  public GenerateHeapData(): GlobalData {
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
    return { success: this.ValidateSingleHeapData(), data };
  }

  public UpdateHeapData(data: GlobalData): CRUDResult<GlobalData> {
    forEach(data, (value: unknown, key: string) => {
      global[key] = value;
    });
    return { success: true, data };
  }

  public InitializeHeap(): boolean {
    return this.UpdateHeapData(this.GenerateHeapData()).success;
  }
}
