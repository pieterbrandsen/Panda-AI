import constantMemoryVersions, {
  VersionedMemoryTypeName,
} from "../utils/constants/memory";

export default class DataMemoryInitializer {
  /**
   * Initializes the roomsData object
   */
  private static InitializeRoomDataMemory(): void {
    Memory.roomsData = {
      data: {},
      version: constantMemoryVersions[VersionedMemoryTypeName.Room],
    };
  }

  /**
   * Setup the memory required for the roomsData object
   */
  public static SetupRoomDataMemory(): void {
    DataMemoryInitializer.InitializeRoomDataMemory();
  }

  /**
   * Initializes the structuresData object
   */
  private static InitializeStructureDataMemory(): void {
    Memory.structuresData = {
      data: {},
      version: constantMemoryVersions[VersionedMemoryTypeName.Structure],
    };
  }

  /**
   * Setup the memory required for the structuresData object
   */
  public static SetupStructureDataMemory(): void {
    DataMemoryInitializer.InitializeStructureDataMemory();
  }

  /**
   * Initializes the creepsData object
   */
  private static InitializeCreepDataMemory(): void {
    Memory.creepsData = {
      data: {},
      version: constantMemoryVersions[VersionedMemoryTypeName.Creep],
    };
  }

  /**
   * Setup the memory required for the creepsData object
   */
  public static SetupCreepDataMemory(): void {
    DataMemoryInitializer.InitializeCreepDataMemory();
  }
}
