import { forEach } from "lodash";
import RoomStats from "../../Memory/Stats/room";

export default function UpdateRoomStats(room: Room): boolean {
  const roomStatsResult = RoomStats.Get(room.name);
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

    if (controller.my) {
      const isSpawning: StringMap<boolean> = {};
      roomStatsMemory.spawnEnergy = {
        capacity: room.energyCapacityAvailable,
        energy: room.energyAvailable,
      };
      const spawns = room.find(FIND_MY_SPAWNS);
      forEach(spawns, (spawn) => {
        if (spawn.spawning) isSpawning[spawn.name] = true;
        else isSpawning[spawn.name] = false;
      });
      roomStatsMemory.isSpawning = isSpawning;
    }
  }

  roomStatsMemory.creepsCount = room.find(FIND_MY_CREEPS).length;
  roomStatsMemory.structuresCount = room.find(FIND_STRUCTURES).length;

  return RoomStats.Update(room.name, roomStatsMemory).success;
}
