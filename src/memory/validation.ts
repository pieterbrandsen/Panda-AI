import memoryVersions from "../utils/constants/memory";

export default class MemoryValidator {
  /**
   * Checks version of memory against same type saved in constants
   * @param version - Version number
   * @param versionName - version name of memory
   * @returns {boolean} true if version is valid
   */
  public static IsMemoryValid(
    version: number,
    versionName: VersionedMemoryName
  ): boolean {
    return version === memoryVersions[versionName];
  }
}