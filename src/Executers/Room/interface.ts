import { forEach, union } from "lodash";
import IRoomData from "../../Managers/BaseModels/Helper/Room/roomMemory";
import IRoomCache from "../../Managers/BaseModels/Cache/roomInterface";
import IControllerManager from "../../Managers/ControllerManager/interface";
import IMineralManager from "../../Managers/MineralManager/interface";
import ISourceManager from "../../Managers/SourceManager/interface";
import ISpawnManager from "../../Managers/SpawnManager/interface";
import ICreepCache from "../../Managers/BaseModels/Cache/creepInterface";
import IStructuresCache from "../../Managers/BaseModels/Cache/structureInterface";
import ICreepExecuter from "../Creep/interface";
import IStructureExecuter from "../Structure/interface";

interface IRoomExecuter {}

export default class implements IRoomExecuter {
  static ExecuteAllRooms(): boolean {
    const roomNamesWithVision = Object.keys(Game.rooms);

    const roomsCache = IRoomCache.GetAll("", false);
    if (!roomsCache.success) {
      return false;
    }
    const roomNames = Object.keys(roomsCache.data);
    forEach(union(roomNames, roomNamesWithVision), (roomName) => {
      const room = Game.rooms[roomName];
      if (!roomsCache[roomName]) {
        IRoomData.Initialize({ room, remoteRooms: {} });
      }

      this.ExecuteRoom(room);
    });
    return true;
  }

  static ExecuteRoom(room: Room | undefined): boolean {
    if (!room) return false;
    const roomData = IRoomData.GetMemory(room.name);
    if (!roomData.success) return false;
    const roomMemory = roomData.memory as RoomMemory;
    const roomCache = roomData.cache as RoomCache;
    const structuresCache = IStructuresCache.GetAll("", false, [room.name]);
    const creepsCache = ICreepCache.GetAll("", false, [room.name]);

    const { controller } = room;
    new ISourceManager(room.name,roomMemory,roomCache).Run();

    if (controller) {
      new IControllerManager(room.name,roomMemory,roomCache).Run();
      if (controller.my) {
        new IMineralManager(room.name,roomMemory,roomCache).Run();
        new ISpawnManager(room.name,roomMemory,roomCache).Run();
      }
    }

    IStructureExecuter.ExecuterAllStructures(structuresCache);
    ICreepExecuter.ExecuterAllCreeps(creepsCache);

    return true;
  }
}
