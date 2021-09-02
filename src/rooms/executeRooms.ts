import { forEach } from "lodash";
import DataMemoryInitializer from "../memory/dataInitialization";
import MemoryInitializer from "../memory/initialization";
import MemoryValidator from "../memory/validation";
import { VersionedMemoryTypeName } from "../utils/constants/memory";

export default class ExecuteRooms {
  public static ExecuteAll(): void {
    if (
      !MemoryValidator.IsMemoryValid(
        Memory.roomsData.version,
        VersionedMemoryTypeName.Room
      )
    ) {
      DataMemoryInitializer.SetupRoomDataMemory();
      if (
        !MemoryValidator.IsMemoryValid(
          Memory.roomsData.version,
          VersionedMemoryTypeName.Room
        )
      )
        return;
    }

    // TODO: Get all rooms out of cache
    forEach(Game.rooms, (room: Room) => {
      ExecuteRooms.Execute(room.name);
    });
  }

  private static Execute(name: string): void {
    const room = Game.rooms[name];
    const memory = Memory.roomsData.data[name];

    if (memory && memory.scout && Game.creeps[memory.scout.name]) return;
    if (room === null) {
      // TODO: Send 1 scout
      // TODO: Garbage collection implement (cache)
      return;
    }
    if (memory === undefined) MemoryInitializer.SetupRoomMemory(name);
    // TODO: Has memory been updated?

    // Update cache

    // Jobs manager

    // Base manager

    // Source manager
    // Mineral manager
    // Controller manager

    // Resource controller manager

    // Spawn manager

    // Room helper

    // Update structure cache
    // Update creeps cache

    // Execute all non executed structures
    // Execute all non executed creeps
  }
}
