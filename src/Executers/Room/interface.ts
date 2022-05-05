import { forEach, union } from "lodash";
import RoomData from "../../Managers/BaseModels/Helper/Room/memory";
import CreepData from "../../Managers/BaseModels/Helper/Creep/memory";
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
import RoomHandler from "./room";

export default class RoomExecuter {
  static ExecuteAllRooms(): boolean {
    const roomsCache = RoomData.GetAllDataBasedOnCache("", false);
    const roomNamesWithVision = Object.keys(Game.rooms);
    forEach(roomNamesWithVision, (roomName) => {
      const room = Game.rooms[roomName];
      if (room && !roomsCache[roomName]) {
        new SetupRoom(room).Initialize();
      }
    });

    const roomNames = Object.keys(roomsCache);
    forEach(union(roomNames, roomNamesWithVision), (roomName) => {
      new RoomHandler(
        roomName,
        roomNamesWithVision.includes(roomName)
      ).Execute();
    });
    return true;
  }
}
