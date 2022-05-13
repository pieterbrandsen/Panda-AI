import { forOwn, sum } from "lodash";
import AverageValue from "../Functions/average";
import StatsMemoryData from "../../Memory/Stats/global";

export default class ResetHeap {
  static Reset(): boolean {
    const statsRepo = new StatsMemoryData();
    const statsData = statsRepo.GetMemoryData();
    if (!statsData.success) return false;
    const statsMemory = statsData.data as StatsMemory;

    forOwn(global.RoomsData, (data: RoomHeap, roomName: string) => {
      const roomStats = statsMemory.rooms[roomName];
      if (roomStats) {
        const newIncoming = data.stats.energyIncoming;
        forOwn(newIncoming, (value: number, key: string) => {
          roomStats.energyIncoming[key] = AverageValue(
            roomStats.energyIncoming[key],
            value
          );
          data.stats.energyIncoming[key] = 0;
        });
        const newOutgoing = data.stats.energyOutgoing;
        forOwn(newOutgoing, (value: number, key: string) => {
          roomStats.energyOutgoing[key] = AverageValue(
            roomStats.energyOutgoing[key],
            value
          );
          data.stats.energyOutgoing[key] = 0;
        });

        const newSpawnOutgoing = data.stats.spawnEnergyOutgoing;
        data.stats.energyOutgoing.SpawnCreeps = sum(
          Object.values(newSpawnOutgoing)
        );
        forOwn(newSpawnOutgoing, (value: number, key: string) => {
          roomStats.spawnEnergyOutgoing[key] = AverageValue(
            roomStats.spawnEnergyOutgoing[key],
            value
          );
          data.stats.spawnEnergyOutgoing[key] = 0;
        });

        roomStats.controller = data.stats.controller;
        if (data.stats.controller)
          data.stats.controller = {
            level: 0,
            progress: 0,
            progressTotal: 0,
            ticksToDowngrade: 0,
          };

        roomStats.creepsCount = AverageValue(
          roomStats.creepsCount,
          data.stats.creepsCount
        );
        data.stats.creepsCount = 0;
        roomStats.structuresCount = AverageValue(
          roomStats.structuresCount,
          data.stats.structuresCount
        );
        data.stats.structuresCount = 0;

        roomStats.isSpawning = data.stats.isSpawning;
        data.stats.isSpawning = {};
      }
    });

    return StatsMemoryData.UpdateMemoryData(statsMemory).success;
  }
}
