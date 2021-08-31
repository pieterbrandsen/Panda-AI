import MemoryValidator from "../memory/validation";
import { VersionedMemoryTypeName } from "../utils/constants/memory";

export default class HeapValidator {
  /**
   * Checks version of heap against value saved in constants
   * @returns {boolean} true if version is valid
   */
  public static IsHeapValid(): boolean {
    return MemoryValidator.IsMemoryValid(
      global.version,
      VersionedMemoryTypeName.Heap
    );
  }
}
