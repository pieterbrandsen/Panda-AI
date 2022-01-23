import IRoomPosition from "../BaseModels/Helper/Room/roomPosition";

interface ISpawnMemory {}

export default class implements ISpawnMemory {
  static SetupMemory(room: Room): ControllerManager {
    const { controller } = room;
    return {
      controller: controller
        ? {
            jobId: undefined,
            id: controller.id,
            pos: IRoomPosition.FreezeRoomPosition(controller.pos),
            isOwned: controller.my,
          }
        : undefined,
    };
  }
}
