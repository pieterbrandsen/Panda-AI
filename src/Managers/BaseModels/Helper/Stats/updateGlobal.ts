import IGlobalStats from "../../Memory/Stats/globalStats";

export default function UpdateGlobalStats(): boolean {
  const globalStatsResult = IGlobalStats.Get();
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


  return IGlobalStats.Update(globalStatsMemory).success;
}
