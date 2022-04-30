import GlobalMemoryData from "../../Memory/global";

export default class GlobalDataHelper {
  static GetMemory(): CRUDResult<Memory> {
    return GlobalMemoryData.Get();
  }

  static CreateMemory(memory: Memory): CRUDResult<Memory> {
    return GlobalMemoryData.Update(memory);
  }

  static DeleteMemory(): CRUDResult<Memory> {
    return GlobalMemoryData.Delete();
  }

  static UpdateMemory(memory: Memory): CRUDResult<Memory> {
    return GlobalMemoryData.Update(memory);
  }

  static Initialize(): CRUDResult<Memory> {
    return GlobalMemoryData.Initialize();
  }
}
