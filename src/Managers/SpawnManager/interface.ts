import IRoomHelper from "../BaseModels/Helper/Room/roomInterface";
import ICreepSpawning from "../BaseModels/CreepSpawning/interface";

interface ISpawnManager {}

export default class implements ISpawnManager {
  updatedMemory = false;

  executer: string;

  room: Room;

  memory: RoomMemory;

  managerMemory: SpawnManager;

  cache: RoomCache;

  constructor(roomName: string,roomMemory:RoomMemory,roomCache:RoomCache) {
    this.room = Game.rooms[roomName];
    this.memory = roomMemory
    this.cache = roomCache;
    this.managerMemory = this.memory.spawnManager;

    this.executer = IRoomHelper.GetExecuter(this.room.name, "Spawn");
  }

  Run(): void {
    const resultOwnedCreeps = new ICreepSpawning(
      this.room.name,
      false
    ).SpawnCreeps();
    // const resultOwnedCreeps = new ICreepSpawning(
    //   this.room.name,
    //   false
    // ).SpawnCreeps();
    // if (resultOwnedCreeps) {
    //   new ICreepSpawning(this.room.name, true).SpawnCreeps();
    // }
  }
}
