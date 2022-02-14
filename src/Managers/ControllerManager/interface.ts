import RoomHelper from "../BaseModels/Helper/Room/interface";
import JobDataHelper from "../BaseModels/Helper/Job/memory";
import RoomDataHelper from "../BaseModels/Helper/Room/memory";
import HandleSourceAndControllerStructure from "../Helper/handleSourceAndControllerStructure";

export default class ControllerManager {
  private isRemote: boolean;

  private updatedMemory = false;

  private executer: string;

  private room: Room;

  private memory: RoomMemory;

  private managerMemory: ControllerManagerMemory;

  private cache: RoomCache;

  private controller: StructureController;

  constructor(roomName: string, roomMemory: RoomMemory, roomCache: RoomCache) {
    this.room = Game.rooms[roomName];
    this.controller = this.room.controller as StructureController;
    this.memory = roomMemory;
    this.cache = roomCache;
    this.managerMemory = this.memory.controllerManager;

    this.isRemote = this.memory.remoteOriginRoom !== undefined;
    this.executer = RoomHelper.GetExecuter(this.room.name, "Controller");
  }

  private UpdateController(): void {
    const { managerMemory } = this;
    const controllerMemory = managerMemory.controller;

    if (controllerMemory) {
      const jobType: JobTypes = !this.isRemote
        ? "UpgradeController"
        : "ReserveController";
      if (controllerMemory.isOwned) {
        JobDataHelper.Initialize({
          executer: this.executer,
          pos: controllerMemory.pos,
          targetId: controllerMemory.id,
          type: jobType,
          amountToTransfer: 10 * 1000 + 5000 * this.controller.level,
          objectType: "Creep",
        });
      }

      HandleSourceAndControllerStructure(
        this.controller,
        controllerMemory,
        "controller",
        this.executer,
        this.controller
      );
    }
  }

  Run(): void {
    if (
      !this.controller &&
      !this.isRemote &&
      this.managerMemory.controller &&
      !this.managerMemory.controller.isOwned
    )
      return;

    this.UpdateController();
    if (this.updatedMemory) {
      RoomDataHelper.UpdateMemory(this.room.name, this.memory);
    }
  }
}
