import { forEach, forOwn } from "lodash";
import ICreepBodyPartHelper from "./bodyPartHelper";

export default class ICreepCountHelper {
  creepsCache: StringMapGeneric<CreepCache[], CreepTypes>;

  jobsMemory: StringMap<JobMemory>;

  jobsCache: StringMap<JobCache>;

  spawnRoom: Room;

  missingCreepCount: StringMapGeneric<
    number,
    CreepTypes
  > = ICreepCountHelper.GetEmptyCreepCountPerType();

  aliveCreepCount: StringMapGeneric<
    number,
    CreepTypes
  > = ICreepCountHelper.GetEmptyCreepCountPerType();

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

  static GetEmptyCreepCountPerType(): StringMapGeneric<number, CreepTypes> {
    return {
      miner: 0,
      worker: 0,
      transferer: 0,
      claimer: 0,
    };
  }

  GetRequiredAliveCreepCountsForJobs(): StringMapGeneric<number, CreepTypes> {
    const creepCounts: StringMapGeneric<
      number,
      CreepTypes
    > = ICreepCountHelper.GetEmptyCreepCountPerType();

    forEach(Object.keys(creepCounts), (type) => {
      creepCounts[type] = Object.keys(this.creepsCache[type] ?? []).length;
    });

    this.aliveCreepCount = creepCounts;
    return creepCounts;
  }

  GetRequiredCreepCountsForJobs(): StringMapGeneric<number, CreepTypes> {
    const creepCounts: StringMapGeneric<
      number,
      CreepTypes
    > = ICreepCountHelper.GetEmptyCreepCountPerType();

    forOwn(this.jobsMemory, (memory, id) => {
      const cache = this.jobsCache[id];
      if (cache) {
        let amount = 0;
        switch (cache.type) {
          case "HarvestSource":
            amount = memory.maxCreepsCount ?? 5;
            break;
          case "HarvestMineral":
            amount = memory.maxCreepsCount ?? 2;
            break;
          case "TransferSpawn":
            if (
              this.spawnRoom.controller &&
              this.spawnRoom.controller.level > 6
            ) {
              amount = memory.maxCreepsCount ?? 3;
            } else {
              amount = memory.maxCreepsCount ?? 10;
            }
            break;
          case "TransferStructure":
          case "WithdrawStructure":
          case "WithdrawResource":
            amount = memory.maxCreepsCount ?? 1;
            break;
          case "Repair":
            amount = memory.maxCreepsCount ?? 4;
            break;
          case "Build":
            amount = memory.maxCreepsCount ?? 4;
            break;
          case "ReserveController":
            amount = memory.maxCreepsCount ?? 2;
            break;
          case "UpgradeController":
            amount = memory.maxCreepsCount ?? 5;
            break;

          // skip default case
        }

        creepCounts[ICreepBodyPartHelper.GetCreepType(cache.type)] += amount;
      }
    });

    forEach(Object.keys(creepCounts), (type) => {
      switch (type as CreepTypes) {
        default:
          if (creepCounts[type] > 15) creepCounts[type][WORK] = 15;
          break;
      }
    });

    return creepCounts;
  }

  GetMissingBodyParts(): void {
    const aliveCreepCount = this.GetRequiredAliveCreepCountsForJobs();
    const requiredCreepCount = this.GetRequiredCreepCountsForJobs();
    const missingCreepCountPerType = ICreepCountHelper.GetEmptyCreepCountPerType();

    forEach(Object.keys(missingCreepCountPerType), (type) => {
      missingCreepCountPerType[type] =
        requiredCreepCount[type] - aliveCreepCount[type];
    });

    this.missingCreepCount = missingCreepCountPerType;
  }
}
