import constantMemoryVersions, {
  VersionedMemoryTypeName,
} from "../utils/constants/memory";

export default class MemoryInitializer {
  /**
   * Initializes the memory of the root
   */
  private static InitializeRootMemory(): void {
    Memory.creepsData = {
      data: {},
      version: -1,
    };
    Memory.structuresData = {
      data: {},
      version: -1,
    };
    Memory.roomsData = {
      data: {},
      version: -1,
    };
    Memory.garbageData = [];
    Memory.version = constantMemoryVersions[VersionedMemoryTypeName.Root];
  }

  /**
   * Setup the memory required to function as root
   */
  public static SetupRootMemory(): void {
    MemoryInitializer.InitializeRootMemory();
  }

  /**
   * Initializes the memory of room
   * @param name - The name of the room
   */
  private static InitializeRoomMemory(name: string): void {
    Memory.roomsData.data[name] = {};
  }

  /**
   * Setup the memory required to function as room
   * @param name - The name of the room
   */
  public static SetupRoomMemory(name: string): void {
    MemoryInitializer.InitializeRoomMemory(name);
  }

  /**
   * Initializes the memory of the structure
   * @param id - The id of the structure
   */
  private static InitializeStructureMemory(id: Id<Structure>): void {
    Memory.structuresData.data[id] = {};
  }

  /**
   * Setup the memory required to function as structure
   * @param id - The id of the structure
   */
  public static SetupStructureMemory(id: Id<Structure>): void {
    MemoryInitializer.InitializeStructureMemory(id);
  }

  /**
   * Initializes the memory of the creep
   * @param name - The name of the creep
   */
  private static InitializeCreepMemory(name: string): void {
    Memory.creepsData.data[name] = {};
  }

  /**
   * Setup the memory required to function as creep
   * @param name - The name of the creep
   */
  public static SetupCreepMemory(name: string): void {
    MemoryInitializer.InitializeCreepMemory(name);
  }
}
