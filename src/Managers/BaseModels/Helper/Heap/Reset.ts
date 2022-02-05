import { forOwn, sum } from "lodash";
import AverageValue from "../Functions/average";
import IStatsMemory from "../../Memory/Stats/globalStats";

interface IResetHeap {}

export default class implements IResetHeap {
  static Reset(): boolean {
    const statsData = IStatsMemory.Get();
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
      }
    });

    return IStatsMemory.Update(statsMemory).success;
  }
}
