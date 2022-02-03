import { forEach, union } from "lodash";
import IRoomData from "../../Managers/BaseModels/Helper/Room/roomMemory";
import IRoomCache from "../../Managers/BaseModels/Cache/roomInterface";
import IControllerManager from "../../Managers/ControllerManager/interface";
import IMineralManager from "../../Managers/MineralManager/interface";
import ISourceManager from "../../Managers/SourceManager/interface";
import IDroppedResourceManager from "../../Managers/DroppedResourceManager/interface";
import ISpawnManager from "../../Managers/SpawnManager/interface";
import ICreepCache from "../../Managers/BaseModels/Cache/creepInterface";
import IStructuresCache from "../../Managers/BaseModels/Cache/structureInterface";
import ICreepExecuter from "../Creep/interface";
import IStructureExecuter from "../Structure/interface";
import IJobs from "../../Managers/BaseModels/Jobs/interface";
import IJobData from "../../Managers/BaseModels/Helper/Job/jobMemory";
import ISetupRoom from "../../Managers/BaseModels/Helper/Room/setupRoom";

interface IRoomExecuter {}

export default class implements IRoomExecuter {
  static ExecuteAllRooms(): boolean {
    const roomsCache = IRoomCache.GetAll("", false);
    const roomNamesWithVision = Object.keys(Game.rooms);
    forEach(roomNamesWithVision, (roomName) => {
      const room = Game.rooms[roomName];
      if (!roomsCache[roomName]) {
    new ISetupRoom(room).Initialize();
      }
    });

    const roomNames = Object.keys(roomsCache);
    forEach(union(roomNames, roomNamesWithVision), (roomName) => {
      this.ExecuteRoom(roomName);
      if (!roomNamesWithVision.includes(roomName)) {
        IJobData.DeleteAllData(roomName);
        IRoomData.DeleteMemory(roomName, true, true);
      }
    });
    return true;
  }

  static ExecuteRoom(roomName: string): boolean {
    const structuresCache = IStructuresCache.GetAll("", false, [roomName]);
    const creepsCache = ICreepCache.GetAll("", false, [roomName]);
    IStructureExecuter.ExecuterAllStructures(structuresCache);
    ICreepExecuter.ExecuterAllCreeps(creepsCache);

    const room = Game.rooms[roomName];
    if (!room) return false;
    const roomData = IRoomData.GetMemory(room.name);
    if (!roomData.success) return false;
    const roomMemory = roomData.memory as RoomMemory;
    const roomCache = roomData.cache as RoomCache;

    IJobs.UpdateAllData(room);

    const { controller } = room;
    new ISourceManager(room.name, roomMemory, roomCache).Run();
    new IDroppedResourceManager(room.name, roomMemory, roomCache).Run();

    if (controller) {
      new IControllerManager(room.name, roomMemory, roomCache).Run();
      if (controller.my) {
        new IMineralManager(room.name, roomMemory, roomCache).Run();
        new ISpawnManager(room.name, roomMemory, roomCache).Run();
      }
    }

    return true;
  }
}
