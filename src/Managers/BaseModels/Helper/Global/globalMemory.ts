import { Mixin } from "ts-mixer";
import GlobalHeapData from "../../Heap/global";
import GlobalMemoryData from "../../Memory/global";

export default class GlobalDataHelper extends Mixin(GlobalHeapData,GlobalMemoryData) {
  public HeapDataRepository = {
    GetData: super.GetHeapData,
    UpdateData: super.UpdateHeapData,
    GenerateData: super.GenerateHeapData,
  };

  public GetData(): CRUDResult<Memory> {
    return super.GetMemoryData();
  }

  public CreateData(memory: Memory): CRUDResult<Memory> {
    return super.UpdateMemoryData(memory);
  }

  public DeleteData(): CRUDResult<Memory> {
    return super.DeleteMemoryData();
  }

  public UpdateData(memory: Memory): CRUDResult<Memory> {
    return super.UpdateMemoryData(memory);
  }

  public InitializeData(): CRUDResult<Memory> {
    return super.InitializeMemoryData();
  }
}
