import IRoomStats from "../../Memory/Stats/roomStats";

export default function UpdateRoomStats(room: Room): boolean {
  const roomStatsResult = IRoomStats.Get(room.name);
  if (!roomStatsResult.success) return false;
  const roomStatsMemory = roomStatsResult.data as RoomStatsMemory;

  const { controller } = room;
  if (controller) {
    roomStatsMemory.controller = {
      level: controller.level,
      progress: controller.progress,
      progressTotal: controller.progressTotal,
      ticksToDowngrade: controller.ticksToDowngrade,
    };
  }

  return IRoomStats.Update(room.name, roomStatsMemory).success;
}
