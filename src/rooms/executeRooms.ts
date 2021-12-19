import { forEach } from "lodash";
import DataMemoryInitializer from "../memory/dataInitialization";
import GarbageCollection from "../memory/garbageCollection";
import MemoryValidator from "../memory/validation";
import { VersionedMemoryTypeName } from "../utils/constants/memory";
import MineralManager from "./managers/mineralManager/manager";
import CacheManager from "../cache/updateCache";
import IsMyRoom from "./helpers/isMyRoom";
import SpawnManager from "./managers/spawnManager/manager";
import SourceManager from "./managers/sourceManager/manager";
import IsRoomSetup from "./helpers/isRoomSetup";
import UpdateSpawningQueue from "./managers/spawnManager/update";
import ControllerManager from './managers/controllerManager/manager';
import PioneerManager from "./managers/pioneerManager/manager";

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

    if (memory.scout && Game.creeps[memory.scout.name]) return;
    if (room === undefined) {
      // TODO: Send 1 scout
      // UpdateSpawningQueue.Update(room, "scout", "scout");
      GarbageCollection.CollectRoom(memory, name);
      return;
    }

    const isRoomSetup = IsRoomSetup(room);
    if (memory.isSpawningPioneers) {
      if (isRoomSetup) memory.isSpawningPioneers = false;
    }
    else if (!isRoomSetup) memory.isSpawningPioneers = true

    if (memory.isSpawningPioneers) PioneerManager.Run(room);

    // Update cache

    // Base manager

    // Source manager
    // Mineral manager

    SourceManager.Run(room);
    if (IsMyRoom(room.controller)) {
      MineralManager.Run(room);
      SpawnManager.Run(room);
      ControllerManager.Run(room);
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
