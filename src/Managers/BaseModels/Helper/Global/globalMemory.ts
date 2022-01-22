import IGlobalMemory from "../../Memory/GlobalInterface";

interface IGlobalHelper {}

export default class implements IGlobalHelper {
  static GetMemory(): CRUDResult<Memory> {
    const result = IGlobalMemory.Get();
    return result;
  }

  static CreateMemory(
    memory: Memory,
  ): CRUDResult<Memory> {
    const result = IGlobalMemory.Update(memory);
    return result;
  }

  static DeleteMemory(
  ): CRUDResult<Memory> {
      const result = IGlobalMemory.Delete();
    return result;
  }

  static UpdateMemory(
    memory: Memory,
  ): CRUDResult<Memory> {
      const result = IGlobalMemory.Update(memory);
    return result;
  }

  static Initialize(
  ): CRUDResult<Memory> {
    const result = IGlobalMemory.Initialize();
    return result;
  }
}
