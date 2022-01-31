import IRoomMemory from "../BaseModels/Memory/roomInterface";
import IRoomHelper from "../BaseModels/Helper/Room/roomInterface";
import IJobData from "../BaseModels/Helper/Job/jobMemory";

interface IControllerManager {}

export default class implements IControllerManager {
  isRemote: boolean;

  updatedMemory = false;

  executer: string;

  room: Room;

  memory: RoomMemory;

  managerMemory: ControllerManager;

  cache: RoomCache;

  constructor(roomName: string, roomMemory: RoomMemory, roomCache: RoomCache) {
    this.room = Game.rooms[roomName];
    this.memory = roomMemory;
    this.cache = roomCache;
    this.managerMemory = this.memory.controllerManager;

    this.isRemote = this.memory.remoteOriginRoom !== undefined;
    this.executer = IRoomHelper.GetExecuter(this.room.name, "Controller");
  }

  UpdateController(): void {
    const { managerMemory } = this;
    const controllerMemory = managerMemory.controller;

    if (controllerMemory) {
      const jobType: JobTypes = !this.isRemote
        ? "UpgradeController"
        : "ReserveController";
      if (controllerMemory.isOwned) {
        IJobData.Initialize({
          executer: this.executer,
          pos: controllerMemory.pos,
          targetId: controllerMemory.id,
          type: jobType,
          amountToTransfer: 10 * 1000,
          objectType: "Creep",
        });
      }
    }
  }

  Run(): void {
    if (
      !this.isRemote &&
      this.managerMemory.controller &&
      !this.managerMemory.controller.isOwned
    )
      return;

    this.UpdateController();
    if (this.updatedMemory) {
      IRoomMemory.Update(this.room.name, this.memory);
    }
  }
}
