import RoomHelper from "../BaseModels/Helper/Room/interface";
import CreepSpawning from "../BaseModels/CreepSpawning/interface";

export default class SpawnManager {
  private updatedMemory = false;

  private executer: string;

  private room: Room;

  private memory: RoomMemory;

  private managerMemory: SpawnManagerMemory;

  private cache: RoomCache;

  constructor(roomName: string, roomMemory: RoomMemory, roomCache: RoomCache) {
    this.room = Game.rooms[roomName];
    this.memory = roomMemory;
    this.cache = roomCache;
    this.managerMemory = this.memory.spawnManager;

    this.executer = RoomHelper.GetExecuter(this.room.name, "Spawn");
  }

  Run(): void {
    const resultOwnedCreeps = new CreepSpawning(this.room.name).SpawnCreeps();
    const capacityEnergy = this.room.energyCapacityAvailable;
    const { energyAvailable } = this.room;
    const energyAvailablePercentage = energyAvailable / capacityEnergy;

    if (
      resultOwnedCreeps &&
      this.memory.remoteRooms &&
      energyAvailablePercentage > 0.5 &&
      energyAvailable > 1000
    ) {
      new CreepSpawning(
        this.room.name,
        Object.keys(this.memory.remoteRooms)
      ).SpawnCreeps();
    }
  }
}
