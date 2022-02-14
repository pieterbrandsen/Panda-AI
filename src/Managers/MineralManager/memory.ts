import RoomPosition from "../BaseModels/Helper/Room/position";

export default class MineralManagerMemoryData {
  static SetupMemory(room: Room): MineralManagerMemory {
    const mineral = room.find(FIND_MINERALS)[0];
    return {
      mineral: mineral
        ? {
            jobId: undefined,
            id: mineral.id,
            pos: RoomPosition.FreezeRoomPosition(mineral.pos),
            type: mineral.mineralType,
          }
        : undefined,
    };
  }
}
