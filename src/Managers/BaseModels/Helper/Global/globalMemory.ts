import { Mixin } from "ts-mixer";
import GlobalHeapData from "../../Heap/global";
import GlobalMemoryData from "../../Memory/global";

export default class GlobalDataHelper extends Mixin(
  GlobalHeapData,
  GlobalMemoryData
) {
  constructor() {
    const heapType: HeapTypes = "Global";
    super(heapType);
  }

  public static GetData(): CRUDResult<Memory> {
    return GlobalMemoryData.GetMemoryData();
  }

  public static CreateData(memory: Memory): CRUDResult<Memory> {
    return GlobalMemoryData.UpdateMemoryData(memory);
  }

  public static DeleteData(): CRUDResult<Memory> {
    return GlobalMemoryData.DeleteMemoryData();
  }

  public static UpdateData(memory: Memory): CRUDResult<Memory> {
    return GlobalMemoryData.UpdateMemoryData(memory);
  }

  public static InitializeData(): CRUDResult<Memory> {
    return GlobalMemoryData.InitializeMemoryData();
  }

  public static ValidateSingleData(): boolean {
    return GlobalMemoryData.ValidateSingleMemoryData();
  }
}
