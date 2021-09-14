import { GetRepairAmount } from "../../utils/constants/predicate";
import JobCreatorHelper from "../jobs/creation";

export default class ControlRepairJob {
  /**
   * Check if structure has need of repairing
   * @param structure - Structure to check
   * @param wallRampartHitPercentage - Percentage required to be repaired
   */
  private static IsStructureDamaged(
    structure: Structure,
    wallRampartHitPercentage: number
  ): IsStructureDamaged {
    const damagedPercentage = (structure.hits / structure.hitsMax) * 100;
    let requiredPercentage = 0;
    switch (structure.structureType) {
      case "road":
        if (damagedPercentage < 50) requiredPercentage = 100;
        break;
      case "rampart":
      case "constructedWall":
        if (structure.hits < 5000)
          requiredPercentage = (5000 / structure.hitsMax) * 100;
        else requiredPercentage = Math.ceil(damagedPercentage * 2) / 2;

        if (requiredPercentage > wallRampartHitPercentage)
          requiredPercentage = wallRampartHitPercentage;
        break;
      default:
        requiredPercentage = 100;
        break;
    }
    const amountLeft = GetRepairAmount(
      requiredPercentage,
      structure.hits,
      structure.hitsMax
    );
    return {
      isDamaged: amountLeft > 0,
      requiredPercentage,
    };
  }

  /**
   * Create an repair job if structure is damaged
   * @param structure - structure to be repaired
   * @param structureManager - Manager of structure
   */
  public static ControlDamagedStructure(
    structure: Structure,
    structureManager: ManagerObject
  ): void {
    const roomMemory = Memory.roomsData.data[structureManager.roomName];
    const { jobs } = roomMemory.managersMemory[structureManager.name];

    const result = ControlRepairJob.IsStructureDamaged(
      structure,
      roomMemory.wallRampartHitPercentage
    );
    if (result.isDamaged) {
      if (!jobs.find((job) => job.targetId === structure.id)) {
        jobs.push(
          JobCreatorHelper.Repair(structure, result.requiredPercentage)
        );
      }
    }
  }
}
