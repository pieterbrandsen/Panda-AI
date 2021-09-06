import { forEach } from "lodash";
import DataMemoryInitializer from "../memory/dataInitialization";
import GarbageCollection from "../memory/garbageCollection";
import MemoryValidator from "../memory/validation";
import { VersionedMemoryTypeName } from "../utils/constants/memory";
import MineralManager from "./managers/mineralManager/manager";
import CacheManager from "../cache/updateCache";
import IsMyRoom from "./helpers/isMyRoom";

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

    CacheManager.UpdateRoom();

    forEach(Object.keys(Memory.roomsData.data), (name: string) => {
      ExecuteRooms.Execute(name);
    });
  }

  private static Execute(name: string): void {
    const room = Game.rooms[name];
    const memory = Memory.roomsData.data[name] as RoomMemory;

    if (memory && memory.scout && Game.creeps[memory.scout.name]) return;
    if (room === undefined) {
      // TODO: Send 1 scout
      GarbageCollection.CollectRoom(memory, name);
      return;
    }
    // TODO: Has memory been updated?

    // Update cache

    // Jobs manager

    // Base manager

    // Source manager
    // Mineral manager

    if (IsMyRoom(room.controller)) {
      MineralManager.Run(room);
    }
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