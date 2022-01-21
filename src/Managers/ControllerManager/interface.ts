import IRoomCache from "../BaseModels/Cache/roomInterface";
import IRoomMemory from "../BaseModels/Memory/roomInterface";
import IRoomHelper from "../BaseModels/Helper/roomInterface";
import IJobMemory from "../BaseModels/Helper/jobMemory";

interface IControllerManager {}

export default class implements IControllerManager {
  isRemote: boolean;

  updatedMemory = false;

  executer: string;

  room: Room;

  memory: RoomMemory;

  managerMemory: ControllerManager;

  cache: RoomCache;

  constructor(roomName: string) {
    this.room = Game.rooms[roomName];
    this.memory = IRoomMemory.Get(roomName).data as RoomMemory;
    this.cache = IRoomCache.Get(roomName).data as RoomCache;
    this.managerMemory = this.memory.controllerManager;

    this.isRemote = this.memory.remoteOriginRoom !== undefined;
    this.executer = IRoomHelper.GetExecuter(this.room.name, "Controller");
  }

  static SetupMemory(room: Room): ControllerManager {
    const { controller } = room;
    return {
      controller: controller
        ? {
            jobId: undefined,
            id: controller.id,
            pos: IRoomHelper.FreezeRoomPosition(controller.pos),
            isOwned: controller.my,
          }
        : undefined,
    };
  }

  UpdateController(): void {
    const { managerMemory } = this;
    const controllerMemory = managerMemory.controller;

    if (controllerMemory) {
      const jobType: JobTypes = !this.isRemote
        ? "UpgradeController"
        : "ReserveController";
      if (!controllerMemory.jobId && controllerMemory.isOwned) {
        const jobResult = IJobMemory.Initialize({
          executer: this.executer,
          pos: controllerMemory.pos,
          targetId: controllerMemory.id,
          type: jobType,
        });
        if (!jobResult.success || !jobResult.cache || !jobResult.memory) return;
        const jobId = IJobMemory.GetJobId(
          jobResult.cache.type,
          jobResult.memory.pos
        );
        if (jobId) {
          controllerMemory.jobId = jobId;
          this.updatedMemory = true;
        }
      }
    }
  }

  Run(): void {
    if (
      !this.isRemote ||
      (this.managerMemory.controller && !this.managerMemory.controller.isOwned)
    )
      return;

    this.UpdateController();
    if (this.updatedMemory) {
      IRoomMemory.Update(this.room.name, this.memory);
    }
  }
}
