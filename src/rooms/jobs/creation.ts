export default class JobCreatorHelper{
  public static HarvestMineral(mineralCache: MineralManagerMineralCache): Job{
    return {
      available: true,
      creationTime: Game.time,
      hasPriority:false,
      id: mineralCache.id,
      targetId: mineralCache.id,
      latestStructureOrCreepAssignedAtTick: 0, 
      type:"harvestMineral",
      pos: mineralCache.pos,
nextUpdateTick: Game.time + 1000,
amountLeftToMine: mineralCache.amount,
    }
  }
}