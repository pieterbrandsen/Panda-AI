import { forEach, forOwn } from "lodash";

export default class CreepBodyPartHelper {
  private creepsData: StringMapGeneric<
    DoubleCRUDResult<CreepMemory, CreepCache>[],
    CreepTypes
  >;

  private jobsData: StringMap<DoubleCRUDResult<JobMemory, JobCache>>;

  private spawnRoom: Room;

  missingBodyParts: StringMapGeneric<
    BodyParts,
    CreepTypes
  > = CreepBodyPartHelper.GetEmptyBodyPartsPerType();

  aliveBodyParts: StringMapGeneric<
    BodyParts,
    CreepTypes
  > = CreepBodyPartHelper.GetEmptyBodyPartsPerType();

  constructor(
    creepsData: StringMapGeneric<
      DoubleCRUDResult<CreepMemory, CreepCache>[],
      CreepTypes
    >,
    jobsData: StringMap<DoubleCRUDResult<JobMemory, JobCache>>,
    spawnRoom: Room
  ) {
    this.creepsData = creepsData;
    this.jobsData = jobsData;
    this.spawnRoom = spawnRoom;

    this.GetMissingBodyParts();
    return this;
  }

  static GetEmptyBodyParts(): BodyParts {
    return {
      attack: 0,
      carry: 0,
      claim: 0,
      move: 0,
      work: 0,
      heal: 0,
      ranged_attack: 0,
      tough: 0,
    };
  }

  static GetEmptyBodyPartsPerType(): StringMapGeneric<BodyParts, CreepTypes> {
    return {
      miner: CreepBodyPartHelper.GetEmptyBodyParts(),
      worker: CreepBodyPartHelper.GetEmptyBodyParts(),
      transferer: CreepBodyPartHelper.GetEmptyBodyParts(),
      claimer: CreepBodyPartHelper.GetEmptyBodyParts(),
      extractor: CreepBodyPartHelper.GetEmptyBodyParts(),
    };
  }

  static ConvertStringMapToBody(body: BodyParts): BodyPartConstant[] {
    const bodyParts: BodyPartConstant[] = [];

    forOwn(body, (count: number, part) => {
      for (let index = 0; index < count; index += 1) {
        bodyParts.push(part as BodyPartConstant);
      }
    });

    return bodyParts;
  }

  static ConvertBodyToStringMap(bodyParts: BodyPartConstant[]): BodyParts {
    const body: BodyParts = {
      attack: 0,
      carry: 0,
      claim: 0,
      move: 0,
      work: 0,
      heal: 0,
      ranged_attack: 0,
      tough: 0,
    };

    forEach(bodyParts, (bodyPart) => {
      body[bodyPart] += 1;
    });

    return body;
  }

  private GetRequiredAliveBodyPartsForJobs(): StringMapGeneric<
    BodyParts,
    CreepTypes
  > {
    const parts: StringMapGeneric<
      BodyParts,
      CreepTypes
    > = CreepBodyPartHelper.GetEmptyBodyPartsPerType();

    forEach(Object.keys(parts), (type) => {
      const bodies: BodyParts[] = (this.creepsData[type] ?? []).map(
        (c) => c.cache.body
      );

      forEach(bodies, (body) => {
        forEach(Object.keys(body), (part) => {
          parts[type][part] += body[part];
        });
      });
    });

    this.aliveBodyParts = parts;
    return parts;
  }

  private GetRequiredBodyPartsForJobs(): StringMapGeneric<
    BodyParts,
    CreepTypes
  > {
    const parts: StringMapGeneric<
      BodyParts,
      CreepTypes
    > = CreepBodyPartHelper.GetEmptyBodyPartsPerType();

    forEach(this.jobsData, (data) => {
      const cache = data.cache as JobCache;
      const memory = data.memory as JobMemory;
      if (cache) {
        let amount = 0;
        let per1Lifetime = 0;
        let multiplier = 1;
        let bodyPart: BodyPartConstant = WORK;
        switch (cache.type) {
          case "HarvestSource":
            bodyPart = CreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = 15 * 1000;
            per1Lifetime = 2500;
            multiplier = 1;
            break;
          case "HarvestMineral":
            bodyPart = CreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            if (
              this.spawnRoom.controller &&
              this.spawnRoom.controller.level > 6 &&
              this.spawnRoom.storage
            ) {
              amount = memory.amountToTransfer ?? 0;
              per1Lifetime = 1000;
              multiplier = 4;
            }
            break;
          case "TransferSpawn":
            bodyPart = CreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            if (
              this.spawnRoom.controller &&
              this.spawnRoom.controller.level > 6
            ) {
              per1Lifetime = 187500;
              multiplier = 0.001;
            } else {
              per1Lifetime = 125000;
              multiplier = 0.1;
            }
            break;
          case "TransferStructure":
          case "PickupResource":
          case "WithdrawResource":
            bodyPart = CreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            per1Lifetime = 125000;
            multiplier = 0.1;
            break;
          // bodyPart = ICreepBodyPartHelper.GetBodyPartForJobType(cache.type);
          // amount = memory.amountToTransfer ?? 0;
          // per1Lifetime = 1000;
          // multiplier = 0.2;
          // break;
          case "Repair":
            bodyPart = CreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            per1Lifetime = 75000;
            multiplier = 1;
            break;
          case "Build":
            bodyPart = CreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            per1Lifetime = 3750;
            multiplier = 2;
            break;
          case "ReserveController":
            bodyPart = CreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            per1Lifetime = 400;
            multiplier = 1;
            break;
          case "UpgradeController":
            bodyPart = CreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            per1Lifetime = 1000;
            multiplier = 2;
            break;
          // skip default case
        }

        let bodyPartsToBeAdded = Math.ceil(
          amount / (per1Lifetime * multiplier)
        );
        if (!bodyPartsToBeAdded) bodyPartsToBeAdded = 0;

        switch (cache.type) {
          case "UpgradeController":
            if (
              this.spawnRoom.controller &&
              this.spawnRoom.controller.level === 8 &&
              bodyPartsToBeAdded > 15
            ) {
              bodyPartsToBeAdded = 15;
            } else if (bodyPartsToBeAdded > 15) {
              bodyPartsToBeAdded = 15;
            }
            break;
          default:
            if (bodyPartsToBeAdded > 40) bodyPartsToBeAdded = 40;
            break;
        }

        parts[CreepBodyPartHelper.GetCreepType(cache.type)][
          bodyPart
        ] += bodyPartsToBeAdded;
      }
    });

    forEach(Object.keys(parts), (type) => {
      switch (type as CreepTypes) {
        case "worker":
          if (parts[type][WORK] > 50) parts[type][WORK] = 50;
          break;
        case "transferer":
          if (parts[type][CARRY] > 100) parts[type][CARRY] = 100;
          else if (parts[type][CARRY] < 8) parts[type][CARRY] = 8;
          break;
        default:
          break;
      }
    });

    return parts;
  }

  static GetBodyPartForJobType(type: JobTypes): BodyPartConstant {
    switch (type) {
      case "Build":
      case "HarvestMineral":
      case "HarvestSource":
      case "Repair":
      case "UpgradeController":
        return WORK;
      case "TransferSpawn":
      case "TransferStructure":
      case "WithdrawResource":
      case "PickupResource":
        return CARRY;
      case "ReserveController":
        return CLAIM;
      default:
        return WORK;
    }
  }

  static GetBodyPartForCreepType(type: CreepTypes): BodyPartConstant {
    switch (type) {
      case "extractor":
      case "miner":
      case "worker":
        return WORK;
      case "transferer":
        return CARRY;
      default:
        return WORK;
    }
  }

  private GetMissingBodyParts(): void {
    const aliveBodyParts = this.GetRequiredAliveBodyPartsForJobs();
    const requiredBodyParts = this.GetRequiredBodyPartsForJobs();
    const missingBodyPartsPerType = CreepBodyPartHelper.GetEmptyBodyPartsPerType();

    forEach(Object.keys(missingBodyPartsPerType), (type) => {
      const missingBodyParts: BodyParts = CreepBodyPartHelper.GetEmptyBodyParts();
      forEach(Object.keys(missingBodyParts), (part) => {
        missingBodyParts[part] = Math.ceil(
          requiredBodyParts[type][part] - aliveBodyParts[type][part]
        );
      });
      missingBodyPartsPerType[type] = missingBodyParts;
    });

    this.missingBodyParts = missingBodyPartsPerType;
  }

  static GetCreepType(type: JobTypes): CreepTypes {
    switch (type) {
      case "Build":
      case "Repair":
      case "UpgradeController":
        return "worker";
      case "HarvestSource":
      case "HarvestMineral":
        return "miner";
      case "PickupResource":
      case "WithdrawResource":
      case "TransferSpawn":
      case "TransferStructure":
        return "transferer";
      case "ReserveController":
        return "claimer";
      default:
        return "worker";
    }
  }
}
