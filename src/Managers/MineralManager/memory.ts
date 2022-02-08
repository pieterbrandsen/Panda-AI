import IRoomPosition from "../BaseModels/Helper/Room/roomPosition";

interface ISpawnMemory {}

export default class implements ISpawnMemory {
  static SetupMemory(room: Room): MineralManager {
    const mineral = room.find(FIND_MINERALS)[0];
    return {
      mineral: mineral
        ? {
            jobId: undefined,
            id: mineral.id,
            pos: IRoomPosition.FreezeRoomPosition(mineral.pos),
            type: mineral.mineralType,
          }
        : undefined,
    };
  }
}
