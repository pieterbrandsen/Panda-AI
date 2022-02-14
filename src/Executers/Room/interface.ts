import { forEach, union } from "lodash";
import RoomData from "../../Managers/BaseModels/Helper/Room/memory";
import StructureData from "../../Managers/BaseModels/Helper/Structure/memory";
import ControllerManager from "../../Managers/ControllerManager/interface";
import MineralManager from "../../Managers/MineralManager/interface";
import SourceManager from "../../Managers/SourceManager/interface";
import DroppedResourceManager from "../../Managers/DroppedResourceManager/interface";
import SpawnManager from "../../Managers/SpawnManager/interface";
import CreepExecuter from "../Creep/interface";
import StructureExecuter from "../Structure/interface";
import Jobs from "../../Managers/BaseModels/Jobs/interface";
import JobData from "../../Managers/BaseModels/Helper/Job/memory";
import SetupRoom from "../../Managers/BaseModels/Helper/Room/setup";
import RoomHeap from "../../Managers/BaseModels/Heap/room";
import UpdateRoomStats from "../../Managers/BaseModels/Helper/Stats/updateRoom";

export default class RoomExecuter {
  static ExecuteAllRooms(): boolean {
    const roomsCache = RoomData.GetAllBasedOnCache("", false);
    const roomNamesWithVision = Object.keys(Game.rooms);
    forEach(roomNamesWithVision, (roomName) => {
      const room = Game.rooms[roomName];
      if (!roomsCache[roomName]) {
        new SetupRoom(room).Initialize();
      }
    });

    const roomNames = Object.keys(roomsCache);
    forEach(union(roomNames, roomNamesWithVision), (roomName) => {
      this.ExecuteRoom(roomName);
      if (!roomNamesWithVision.includes(roomName)) {
        JobData.DeleteAllData(roomName);
        RoomData.DeleteMemory(roomName, true, true);
      }
    });
    return true;
  }

  static ExecuteRoom(roomName: string): boolean {
    const structuresData = StructureData.GetAllBasedOnCache("", false, [
      roomName,
    ]);
    const creepsCache = RoomData.GetAllBasedOnCache("", false, [roomName]);
    StructureExecuter.ExecuterAllStructures(Object.keys(structuresData));
    CreepExecuter.ExecuterAllCreeps(Object.keys(creepsCache));

    const room = Game.rooms[roomName];
    if (!room) return false;
    const roomData = RoomData.GetMemory(room.name);
    if (!roomData.success) return false;
    const roomHeapData = RoomHeap.Get(room.name);
    if (!roomHeapData.success) {
      RoomHeap.Initialize(room.name);
    }

    const roomMemory = roomData.memory as RoomMemory;
    const roomCache = roomData.cache as RoomCache;

    UpdateRoomStats(room);
    Jobs.UpdateAllData(room);

    const { controller } = room;
    new SourceManager(room.name, roomMemory, roomCache).Run();
    new DroppedResourceManager(room.name, roomMemory, roomCache).Run();

    if (controller) {
      new ControllerManager(room.name, roomMemory, roomCache).Run();
      if (controller.my) {
        new MineralManager(room.name, roomMemory, roomCache).Run();
        new SpawnManager(room.name, roomMemory, roomCache).Run();
      }
    }

    return true;
  }
}
