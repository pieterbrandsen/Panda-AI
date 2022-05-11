import GlobalStats from "../../Memory/Stats/global";
import UpdateRoomStats from './updateRoom';

export default function UpdateGlobalStats(): boolean {
  const globalStatsRepo = new GlobalStats();
  const globalStatsResult = globalStatsRepo.GetMemoryData();
  if (!globalStatsResult.success) return false;
  const globalStatsMemory = globalStatsResult.data as StatsMemory;

  Memory.stats.resources = {
    CPU_UNLOCK: Game.resources[CPU_UNLOCK],
    PIXEL: Game.resources[PIXEL],
    ACCESS_KEY: Game.resources[ACCESS_KEY],
  };

  Memory.stats.gcl = {
    level: Game.gcl.level,
    progress: Game.gcl.progress,
    progressTotal: Game.gcl.progressTotal,
  };

  return globalStatsRepo.UpdateMemoryData(globalStatsMemory).success;
}
