import RoomHelper from "../BaseModels/Helper/Room/interface";
import HandleSourceAndControllerStructure from "../Helper/handleSourceAndControllerStructure";
import JobData from "../BaseModels/Helper/Job/memory";

export default class RoomControllerManager {
  protected _roomInformation: RoomInformation;

  protected _executer: string;

  protected _isRemote: boolean;

  constructor(roomInformation: RoomInformation) {
    this._roomInformation = roomInformation;
    this._isRemote = roomInformation.memory!.remoteOriginRoom !== undefined;
    this._executer = RoomHelper.GetExecuter(
      roomInformation.room!.name,
      "Controller"
    );
  }

  private UpdateController(): void {
    const controller = this._roomInformation.room!.controller!;
    const managerMemory = this._roomInformation.memory!.controllerManager;
    const controllerMemory = managerMemory.controller;

    if (controllerMemory) {
      const jobType: JobTypes = !this._isRemote
        ? "UpgradeController"
        : "ReserveController";
      if (controllerMemory.isOwned) {
        new JobData(undefined, jobType, controllerMemory.pos).InitializeData({
          executer: this._executer,
          pos: controllerMemory.pos,
          targetId: controllerMemory.id,
          type: jobType,
          amountToTransfer: 10 * 1000 + 5000 * controller.level,
          objectType: "Creep",
        });
      }

      HandleSourceAndControllerStructure(
        controller,
        controllerMemory,
        "controller",
        this._executer,
        controller
      );
    }
  }

  protected ExecuteRoomControllerManager(): void {
    const { controller } = this._roomInformation.room!;
    const managerMemory = this._roomInformation.memory!.controllerManager;
    if (
      !controller &&
      !this._isRemote &&
      managerMemory.controller &&
      !managerMemory.controller.isOwned
    )
      return;

    this.UpdateController();
  }
}
