import RoomPositionHelper from "../BaseModels/Helper/Room/position";

export default class ControllerManagerMemoryData {
  static SetupMemory(room: Room): ControllerManagerMemory {
    const { controller } = room;
    return {
      controller: controller
        ? {
            id: controller.id,
            pos: RoomPositionHelper.FreezeRoomPosition(controller.pos),
            isOwned: controller.my,
          }
        : undefined,
    };
  }
}
