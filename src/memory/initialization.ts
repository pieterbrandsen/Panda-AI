import { forOwn } from "lodash";
import {
  DefaultCreepMemory,
  DefaultRoomMemory,
  DefaultRootMemory,
  DefaultStructureMemory,
} from "../utils/constants/memory";
import RemoveAllConstructionSites from "../rooms/helpers/removeAllConstructionSites";

export default class MemoryInitializer {
  /**
   * Initializes the memory of the root
   */
  private static InitializeRootMemory(): void {
    forOwn(DefaultRootMemory, (value, key) => {
      Memory[key] = value;
    });
  }

  /**
   * Setup the memory required to function as root
   */
  public static SetupRootMemory(): void {
    MemoryInitializer.InitializeRootMemory();
  }

  /**
   * Initializes the memory of room if no garbage collected object was found
   * @param name - The name of the room
   */
  private static InitializeRoomMemory(name: string): void {
    const garbageMemory = Memory.garbageData[name];
    if (garbageMemory) {
      Memory.roomsData.data[name] = garbageMemory.data as RoomMemory;
      return;
    }
    Memory.roomsData.data[name] = DefaultRoomMemory(name);
  }

  /**
   * Setup the memory required to function as room
   * @param room - The room object to be modified
   */
  public static SetupRoomMemory(room: Room): void {
    MemoryInitializer.InitializeRoomMemory(room.name);

    RemoveAllConstructionSites(room);
  }

  /**
   * Initializes the memory of the structure if no garbage collected object was found
   * @param id - The id of the structure
   * @param manager - Manager associated with the structure
   */
  private static InitializeStructureMemory(
    id: Id<Structure>,
    manager: ManagerObject
  ): void {
    const garbageMemory = Memory.garbageData[id];
    if (garbageMemory) {
      Memory.structuresData.data[id] = garbageMemory.data as StructureMemory;
      delete Memory.garbageData[id];
      return;
    }
    // TODO: Check in test if it used DefaultStructureMemory function instead of garbage memory when required
    Memory.structuresData.data[id] = DefaultStructureMemory(manager);
  }

  /**
   * Setup the memory required to function as structure
   * @param id - The id of the structure
   * @param manager - Manager associated with the structure
   */
  public static SetupStructureMemory(
    id: Id<Structure>,
    manager: ManagerObject
  ): void {
    MemoryInitializer.InitializeStructureMemory(id, manager);
  }

  /**
   * Initializes the memory of the creep if no garbage collected object was found
   * @param name - The name of the creep
   * @param manager - Manager associated with the creep
   */
  private static InitializeCreepMemory(
    name: string,
    manager: ManagerObject
  ): void {
    const garbageMemory = Memory.garbageData[name];
    if (garbageMemory) {
      Memory.creepsData.data[name] = garbageMemory.data as CreepMemory;
      delete Memory.garbageData[name];
      return;
    }
    Memory.creepsData.data[name] = DefaultCreepMemory(manager);
  }

  /**
   * Setup the memory required to function as creep
   * @param name - The name of the creep
   * @param manager - Manager associated with the creep
   */
  public static SetupCreepMemory(name: string, manager: ManagerObject): void {
    MemoryInitializer.InitializeCreepMemory(name, manager);
  }
}
