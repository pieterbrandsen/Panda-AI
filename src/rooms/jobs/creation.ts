export default class JobCreatorHelper {
  /**
   * Create an mineral job
   * @param mineralCache - Cache object
   * @returns
   */
  public static HarvestMineral(mineralCache: MineralManagerMineralCache): Job {
    return {
      available: true,
      creationTime: Game.time,
      hasPriority: false,
      id: mineralCache.id,
      targetId: mineralCache.id,
      latestStructureOrCreepAssignedAtTick: 0,
      type: "harvestMineral",
      pos: mineralCache.pos,
      nextUpdateTick: Game.time + 1000,
      amountLeft: mineralCache.amount,
      hasNeedOfFulfillment: true,
    };
  }

  public static Transfer(
    structure: Structure,
    requiredPercentage: number,
    resourceType: ResourceConstant,
    amountLeft: number,
    hasNeedOfFulfillment = false
  ): Job {
    return {
      available: true,
      creationTime: Game.time,
      hasPriority: false,
      id: structure.id,
      targetId: structure.id,
      latestStructureOrCreepAssignedAtTick: 0,
      type: "transfer",
      pos: structure.pos,
      nextUpdateTick: Game.time + 1000,
      requiredPercentage,
      hasNeedOfFulfillment,
      resourceType,
      amountLeft,
    };
  }

  public static Withdraw(
    structure: Structure,
    requiredPercentage: number,
    resourceType: ResourceConstant,
    amountLeft: number,
    hasNeedOfFulfillment = false
  ): Job {
    return {
      available: true,
      creationTime: Game.time,
      hasPriority: false,
      id: structure.id,
      targetId: structure.id,
      latestStructureOrCreepAssignedAtTick: 0,
      type: "withdraw",
      pos: structure.pos,
      nextUpdateTick: Game.time + 1000,
      requiredPercentage,
      hasNeedOfFulfillment,
      resourceType,
      amountLeft,
    };
  }
}
