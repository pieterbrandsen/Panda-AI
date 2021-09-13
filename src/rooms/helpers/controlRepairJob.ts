import { GetRepairAmount } from "../../utils/constants/predicate";
import JobCreatorHelper from "../jobs/creation";

export default class ControlRepairJob {
  private static IsStructureDamaged(
    structure: Structure,
    wallRampartHitPercentage: number
  ): IsStructureDamaged {
    const damagedPercentage = structure.hits / structure.hitsMax;
    let requiredPercentage = 0;
    switch (structure.structureType) {
      // case "road":
      //   break;
      case "rampart":
      case "constructedWall":
        if (structure.hits < 5000)
          requiredPercentage = (5000 / structure.hitsMax) * 100;
        else requiredPercentage = Math.ceil(damagedPercentage * 200) / 2;

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
