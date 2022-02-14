import GlobalMemoryData from "../../Memory/global";

export default class GlobalDataHelper {
  static GetMemory(): CRUDResult<Memory> {
    const result = GlobalMemoryData.Get();
    return result;
  }

  static CreateMemory(memory: Memory): CRUDResult<Memory> {
    const result = GlobalMemoryData.Update(memory);
    return result;
  }

  static DeleteMemory(): CRUDResult<Memory> {
    const result = GlobalMemoryData.Delete();
    return result;
  }

  static UpdateMemory(memory: Memory): CRUDResult<Memory> {
    const result = GlobalMemoryData.Update(memory);
    return result;
  }

  static Initialize(): CRUDResult<Memory> {
    const result = GlobalMemoryData.Initialize();
    return result;
  }
}
