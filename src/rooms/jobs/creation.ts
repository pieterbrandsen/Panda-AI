import { GetRepairAmount } from "../../utils/constants/predicate";

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
      mineralType: mineralCache.type,
    };
  }

  /**
   * Create an source job
   * @param freezedSource - Frozen source for job
   * @returns
   */
  public static HarvestSource(
    freezedSource: FreezedSource,
    sourceId: Id<Source>
  ): Job {
    return {
      available: true,
      creationTime: Game.time,
      hasPriority: false,
      id: sourceId,
      targetId: sourceId,
      latestStructureOrCreepAssignedAtTick: 0,
      type: "harvestSource",
      pos: freezedSource.pos,
      nextUpdateTick: Game.time + 1000,
      amountLeft: freezedSource.energy,
      hasNeedOfFulfillment: true,
    };
  }

  /**
   * Create an repair job
   * @param structure - Structure for job
   * @param requiredPercentage - Required percentage to fill too
   * @returns
   */
  public static Repair(
    structure: Structure,
    requiredPercentage: number,
    hasPriority = false
  ): Job {
    return {
      available: true,
      creationTime: Game.time,
      hasPriority,
      id: structure.id,
      targetId: structure.id,
      latestStructureOrCreepAssignedAtTick: 0,
      type: "repair",
      pos: structure.pos,
      nextUpdateTick: Game.time + 500,
      hasNeedOfFulfillment: true,
      requiredPercentage,
      amountLeft: GetRepairAmount(
        requiredPercentage,
        structure.hits,
        structure.hitsMax
      ),
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
      nextUpdateTick: Game.time + 50,
      requiredPercentage,
      hasNeedOfFulfillment,
      resourceType,
      amountLeft,
    };
  }

  /**
   * Create an TransferSpawning job
   * @param structure - Structure for job
   * @param requiredPercentage - Required percentage to fill too
   * @param resourceType - type of resource to transfer
   * @param amountLeft - amount left to transfer
   * @param hasNeedOfFulfillment - Does need to be fulfilled or only when creep needs to loose energy
   * @returns - An job
   */
  public static TransferSpawning(
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
      type: "transferSpawning",
      pos: structure.pos,
      nextUpdateTick: Game.time + 50,
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
      nextUpdateTick: Game.time + 50,
      requiredPercentage,
      hasNeedOfFulfillment,
      resourceType,
      amountLeft,
    };
  }
  public static Upgrade(
    roomController: StructureController,
  ): Job {
    return {
      available: true,
      creationTime: Game.time,
      hasPriority: false,
      id: roomController.id,
      targetId: roomController.id,
      latestStructureOrCreepAssignedAtTick: 0,
      type: "harvestSource",
      pos: roomController.pos,
      nextUpdateTick: Game.time + 1000,
      amountLeft: roomController.level * 500,
      hasNeedOfFulfillment: true,
    };
  }
}
