import IRoomCache from "../BaseModels/Cache/roomInterface";
import IRoomMemory from "../BaseModels/Memory/roomInterface";
import IRoomHelper from "../BaseModels/Helper/roomInterface";
import ICreepSpawning from "../BaseModels/CreepSpawning/interface";
    
interface ISpawnManager {}

export default class implements ISpawnManager {
    updatedMemory = false;

    executer: string;
  
    room: Room;
  
    memory: RoomMemory;
  
    managerMemory: SpawnManager;
  
    cache: RoomCache;
  
    constructor(roomName: string) {
      this.room = Game.rooms[roomName];
      this.memory = IRoomMemory.Get(roomName).data as RoomMemory;
      this.cache = IRoomCache.Get(roomName).data as RoomCache;
      this.managerMemory = this.memory.spawnManager;
  
      this.executer = IRoomHelper.GetExecuter(this.room.name, "Spawn");
    }

    static SetupMemory(room: Room): SpawnManager {
      return {};
    }

    Run():void {
        const resultOwnedCreeps = new ICreepSpawning(this.room.name,false).SpawnCreeps();
        if (resultOwnedCreeps) {
          new ICreepSpawning(this.room.name,true).SpawnCreeps()
        }
    }
  }
  