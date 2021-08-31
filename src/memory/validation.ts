import constantMemoryVersions, { VersionedMemoryTypeName } from "../utils/constants/memory";

export default class MemoryValidator {
  /**
   * Checks version of memory against same type saved in constants
   * @param version - Version number
   * @param memoryTypeName - version name of memory
   * @returns {boolean} true if version is valid
   */
  public static IsMemoryValid(
    version: number,
    memoryTypeName: VersionedMemoryTypeName
  ): boolean {
    const constantMemoryVersion = constantMemoryVersions[memoryTypeName];
    return version === constantMemoryVersion;
  }
}
