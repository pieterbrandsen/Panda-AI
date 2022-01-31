import { forEach, forOwn } from "lodash";

export default class ICreepBodyPartHelper {
  creepsCache: StringMapGeneric<CreepCache[], CreepTypes>;

  jobsMemory: StringMap<JobMemory>;

  jobsCache: StringMap<JobCache>;

  spawnRoom: Room;

  missingBodyParts: StringMapGeneric<
    BodyParts,
    CreepTypes
  > = ICreepBodyPartHelper.GetEmptyBodyPartsPerType();

  aliveBodyParts: StringMapGeneric<
    BodyParts,
    CreepTypes
  > = ICreepBodyPartHelper.GetEmptyBodyPartsPerType();

  constructor(
    creepsCache: StringMapGeneric<CreepCache[], CreepTypes>,
    jobsMemory: StringMap<JobMemory>,
    jobsCache: StringMap<JobCache>,
    spawnRoom: Room
  ) {
    this.creepsCache = creepsCache;
    this.jobsMemory = jobsMemory;
    this.jobsCache = jobsCache;
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
      miner: ICreepBodyPartHelper.GetEmptyBodyParts(),
      worker: ICreepBodyPartHelper.GetEmptyBodyParts(),
      transferer: ICreepBodyPartHelper.GetEmptyBodyParts(),
      claimer: ICreepBodyPartHelper.GetEmptyBodyParts(),
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

  GetRequiredAliveBodyPartsForJobs(): StringMapGeneric<BodyParts, CreepTypes> {
    const parts: StringMapGeneric<
      BodyParts,
      CreepTypes
    > = ICreepBodyPartHelper.GetEmptyBodyPartsPerType();

    forEach(Object.keys(parts), (type) => {
      const bodies: BodyParts[] = (this.creepsCache[type] ?? []).map(
        (c) => c.body
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

  GetRequiredBodyPartsForJobs(): StringMapGeneric<BodyParts, CreepTypes> {
    const parts: StringMapGeneric<
      BodyParts,
      CreepTypes
    > = ICreepBodyPartHelper.GetEmptyBodyPartsPerType();

    forOwn(this.jobsMemory, (memory, id) => {
      const cache = this.jobsCache[id];
      if (cache) {
        let amount = 0;
        let per1Lifetime = 0;
        let multiplier = 1;
        let bodyPart: BodyPartConstant = WORK;
        switch (cache.type) {
          case "HarvestSource":
            bodyPart = ICreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = 15 * 1000;
            per1Lifetime = 2500;
            multiplier = 1;
            break;
          case "HarvestMineral":
            bodyPart = ICreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            per1Lifetime = 1000;
            multiplier = 4;
            break;
          case "TransferSpawn":
            bodyPart = ICreepBodyPartHelper.GetBodyPartForJobType(cache.type);
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
          case "WithdrawStructure":
              bodyPart = ICreepBodyPartHelper.GetBodyPartForJobType(cache.type);
              amount = memory.amountToTransfer ?? 0;
              per1Lifetime = 125000;
              multiplier = 0.1;
              break;
          case "WithdrawResource":
            bodyPart = ICreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            per1Lifetime = 1000;
            multiplier = 0.1;
            break;
          case "Repair":
            bodyPart = ICreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            per1Lifetime = 75000;
            multiplier = 1;
            break;
          case "Build":
            bodyPart = ICreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            per1Lifetime = 3750;
            multiplier = 2;
            break;
          case "ReserveController":
            bodyPart = ICreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            per1Lifetime = 400;
            multiplier = 1;
            break;
          case "UpgradeController":
            bodyPart = ICreepBodyPartHelper.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            per1Lifetime = 2000;
            multiplier = 1;
            break;
          // skip default case
        }

        let bodyPartsToBeAdded = Math.ceil(
          amount / (per1Lifetime * multiplier)
        );

        switch (cache.type) {
          case "UpgradeController":
            if (bodyPartsToBeAdded > 15) bodyPartsToBeAdded = 15;
            break;
          default:
            if (bodyPartsToBeAdded > 40) bodyPartsToBeAdded = 40;
            break;
        }

        parts[ICreepBodyPartHelper.GetCreepType(cache.type)][
          bodyPart
        ] += bodyPartsToBeAdded;
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
      case "WithdrawStructure":
        return CARRY;
      case "ReserveController":
        return CLAIM;
      default:
        return WORK;
    }
  }

  static GetBodyPartForCreepType(type: CreepTypes): BodyPartConstant {
    switch (type) {
      case "miner":
      case "worker":
        return WORK;
      case "transferer":
        return CARRY;
      default:
        return WORK;
    }
  }

  GetMissingBodyParts(): void {
    const aliveBodyParts = this.GetRequiredAliveBodyPartsForJobs();
    const requiredBodyParts = this.GetRequiredBodyPartsForJobs();
    const missingBodyPartsPerType = ICreepBodyPartHelper.GetEmptyBodyPartsPerType();

    forEach(Object.keys(missingBodyPartsPerType), (type) => {
      const missingBodyParts: BodyParts = ICreepBodyPartHelper.GetEmptyBodyParts();
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
        return "miner";
      case "WithdrawStructure":
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
