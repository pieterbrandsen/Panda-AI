import RoomHelper from "../BaseModels/Helper/Room/interface";
import CreepSpawning from "../BaseModels/CreepSpawning/interface";

export default class RoomSpawnManager {
  protected _roomInformation: RoomInformation;
  protected _executer: string;

  constructor(roomInformation: RoomInformation) {
    this._roomInformation = roomInformation;
    this._executer = RoomHelper.GetExecuter(roomInformation.room!.name, "Mineral");
  }

  private SpawnCreeps() {
    const room = this._roomInformation.room!;
    const roomMemory = this._roomInformation.memory!;
    const resultOwnedCreeps = new CreepSpawning(room.name).SpawnCreeps();
    const capacityEnergy = room.energyCapacityAvailable;
    const { energyAvailable } = room;
    const energyAvailablePercentage = energyAvailable / capacityEnergy;

    if (
      resultOwnedCreeps &&
      roomMemory.remoteRooms &&
      energyAvailablePercentage > 0.5 &&
      energyAvailable > 1000
    ) {
      new CreepSpawning(
        room.name,
        Object.keys(roomMemory.remoteRooms)
      ).SpawnCreeps();
    }
  }

  protected ExecuteRoomSpawnManager(): void {
    this.SpawnCreeps();
  }
}
