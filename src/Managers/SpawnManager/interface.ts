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

  constructor(roomName: string, roomMemory: RoomMemory, roomCache: RoomCache) {
    this.room = Game.rooms[roomName];
    this.memory = roomMemory;
    this.cache = roomCache;
    this.managerMemory = this.memory.spawnManager;

    this.executer = IRoomHelper.GetExecuter(this.room.name, "Spawn");
  }

  Run(): void {
    const resultOwnedCreeps = new ICreepSpawning(this.room.name).SpawnCreeps();
    const capacityEnergy = this.room.energyCapacityAvailable;
    const { energyAvailable } = this.room;
    const energyAvailablePercentage = energyAvailable / capacityEnergy;

    if (
      resultOwnedCreeps &&
      this.memory.remoteRooms &&
      energyAvailablePercentage > 0.5 &&
      energyAvailable > 1000
    ) {
      new ICreepSpawning(
        this.room.name,
        Object.keys(this.memory.remoteRooms)
      ).SpawnCreeps();
    }
  }
}
