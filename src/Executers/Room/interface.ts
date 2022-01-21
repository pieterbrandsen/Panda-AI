import IRoomData from "../../Managers/BaseModels/Helper/roomMemory";
import IRoomCache from "../../Managers/BaseModels/Cache/roomInterface";
import IControllerManager from "../../Managers/ControllerManager/interface";
import IMineralManager from "../../Managers/MineralManager/interface";
import ISourceManager from "../../Managers/SourceManager/interface";
import ISpawnManager from "../../Managers/SpawnManager/interface";
import ICreepCache from "../../Managers/BaseModels/Cache/creepInterface" 
import IStructuresCache from "../../Managers/BaseModels/Cache/structureInterface" 
import ICreepExecuter from "../Creep/interface";
import IStructureExecuter from "../Structure/interface";
import { forEach } from "lodash";

interface IRoomExecuter {}

export default class implements IRoomExecuter {
    static ExecuteAllRooms() {
        const roomData = IRoomCache.GetAll("",false);
        if (!roomData.success) {
            return;
        }
        const roomNames = Object.keys(roomData.data);
        forEach(roomNames, (roomName) => {
            const room = Game.rooms[roomName];
            this.ExecuteRoom(room);
        })
    }
    static ExecuteRoom(room: Room | undefined):boolean {
        if (!room) return false;
        const roomData = IRoomData.GetMemory(room.name);
        if (!roomData.success) return false;
        const roomMemory = roomData.memory as RoomMemory;
        const roomCache = roomData.cache as RoomCache;
        const structuresCache = IStructuresCache.GetAll("",false,[room.name]);
        const creepsCache = ICreepCache.GetAll("",false,[room.name]);

        const controller = room.controller;
        new ISourceManager(room.name).Run();
        
        if (controller) {
            new IControllerManager(room.name).Run();
            if (controller.my) {
                new IMineralManager(room.name).Run();
                new ISpawnManager(room.name).Run();
            }
        }

        
        IStructureExecuter.ExecuterAllStructures(structuresCache);
        ICreepExecuter.ExecuterAllCreeps(creepsCache);

        return true


    }
}