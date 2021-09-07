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

  /**
   * Create an transfer job
   * @param structure - Structure for job
   * @param requiredPercentage - Required percentage to fill too
   * @param resourceType - type of resource to transfer
   * @param amountLeft - amount left to transfer
   * @param hasNeedOfFulfillment - Does need to be fulfilled or only when creep needs to loose energy
   * @returns - An job
   */
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

  /**
   * Create an withdraw job
   * @param structure - Structure for job
   * @param requiredPercentage - Required percentage to fill too
   * @param resourceType - type of resource to transfer
   * @param amountLeft - amount left to transfer
   * @param hasNeedOfFulfillment - Does need to be fulfilled or only when creep needs to loose energy
   * @returns - An job
   */
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
