import { forEach } from "lodash";
import CreepBodyPartHelper from "./bodyPartHelper";

export default class CreepCountHelper {
  private creepsData: StringMapGeneric<
    DoubleCRUDResult<CreepMemory, CreepCache>[],
    CreepTypes
  >;

  private jobsData: StringMap<DoubleCRUDResult<JobMemory, JobCache>>;

  private spawnRoom: Room;

  missingCreepCount: StringMapGeneric<
    number,
    CreepTypes
  > = CreepCountHelper.GetEmptyCreepCountPerType();

  aliveCreepCount: StringMapGeneric<
    number,
    CreepTypes
  > = CreepCountHelper.GetEmptyCreepCountPerType();

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

  static GetEmptyCreepCountPerType(): StringMapGeneric<number, CreepTypes> {
    return {
      miner: 0,
      worker: 0,
      transferer: 0,
      claimer: 0,
      extractor: 0,
    };
  }

  private GetRequiredAliveCreepCountsForJobs(): StringMapGeneric<
    number,
    CreepTypes
  > {
    const creepCounts: StringMapGeneric<
      number,
      CreepTypes
    > = CreepCountHelper.GetEmptyCreepCountPerType();

    forEach(Object.keys(creepCounts), (type) => {
      creepCounts[type] = Object.keys(this.creepsData[type] ?? []).length;
    });

    this.aliveCreepCount = creepCounts;
    return creepCounts;
  }

  private GetRequiredCreepCountsForJobs(): StringMapGeneric<
    number,
    CreepTypes
  > {
    const creepCounts: StringMapGeneric<
      number,
      CreepTypes
    > = CreepCountHelper.GetEmptyCreepCountPerType();

    forEach(this.jobsData, (data) => {
      const cache = data.cache as JobCache;
      const memory = data.memory as JobMemory;

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

        creepCounts[CreepBodyPartHelper.GetCreepType(cache.type)] += amount;
      }
    });

    forEach(Object.keys(creepCounts), (type) => {
      switch (type as CreepTypes) {
        default:
          if (creepCounts[type] > 15) creepCounts[type] = 15;
          break;
      }
    });

    return creepCounts;
  }

  private GetMissingBodyParts(): void {
    const aliveCreepCount = this.GetRequiredAliveCreepCountsForJobs();
    const requiredCreepCount = this.GetRequiredCreepCountsForJobs();
    const missingCreepCountPerType = CreepCountHelper.GetEmptyCreepCountPerType();

    forEach(Object.keys(missingCreepCountPerType), (type) => {
      missingCreepCountPerType[type] =
        requiredCreepCount[type] - aliveCreepCount[type];
    });

    this.missingCreepCount = missingCreepCountPerType;
  }
}
