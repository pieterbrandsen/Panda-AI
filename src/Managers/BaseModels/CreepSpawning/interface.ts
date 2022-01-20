import { findKey, forEach, forOwn, groupBy, mergeWith, reduce } from "lodash";
import IRoomHelper from "../Helper/roomInterface";
import IRoomMemory from "../Memory/roomInterface";
import IJobMemory from "../Memory/jobInterface";
import IJobCache from "../Cache/jobInterface";
import CachePredicates from "../Cache/predicates";
import ICreepCache from "../Cache/creepInterface";
import IStructureCache from "../Cache/structureInterface";
import ICreepMemory from "../Memory/creepInterface";
import IJob from "../Jobs/interface";

interface ICreepSpawning {}

// TODO: generate actual creep body at spawn instead of pre.
// TODO: Check which creeps are missing for an functioning room and spawn those.

export default class CreepSpawning implements ICreepSpawning {
  isRemoteCreep = false;

  roomNames: string[];

  defaultIteratee: StringMapGeneric<BodyCost, CreepTypes> = {
    transferer: {
      body: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
      cost: 300,
      reqBodyPartPerLoop: 3,
      maxLoopCount: 1,
    },
    worker: {
      body: [WORK, MOVE, CARRY, MOVE, CARRY],
      cost: 300,
      reqBodyPartPerLoop: 1,
      maxLoopCount: 1,
    },
    miner: {
      body: [WORK, WORK, MOVE],
      cost: 250,
      reqBodyPartPerLoop: 2,
      maxLoopCount: 1,
    },
  };

  loopIteratee: StringMapGeneric<BodyCost, CreepTypes> = {
    transferer: {
      body: [CARRY, MOVE],
      cost: 100,
      reqBodyPartPerLoop: 1,
      maxLoopCount: 20,
    },
    worker: {
      body: [WORK, MOVE, CARRY],
      cost: 200,
      reqBodyPartPerLoop: 1,
      maxLoopCount: 10,
    },
    miner: {
      body: [WORK, MOVE],
      cost: 150,
      reqBodyPartPerLoop: 1,
      maxLoopCount: 4,
    },
  };

  spawnRoom: Room;

  jobsMemory: StringMap<JobMemory>;

  jobsCache: StringMap<JobCache>;

  creepsCache: StringMapGeneric<CreepCache[], CreepTypes>;

  emptyBodyParts: BodyParts = {
    attack: 0,
    carry: 0,
    claim: 0,
    move: 0,
    work: 0,
    heal: 0,
    ranged_attack: 0,
    tough: 0,
  };

  emptyBodyPartsPerType: StringMapGeneric<BodyParts, CreepTypes> = {
    miner: this.emptyBodyParts,
    worker: this.emptyBodyParts,
    transferer: this.emptyBodyParts,
  };

  missingBodyParts: StringMapGeneric<BodyParts, CreepTypes> = this
    .emptyBodyPartsPerType;

  aliveBodyParts: StringMapGeneric<BodyParts, CreepTypes> = this
    .emptyBodyPartsPerType;

  spawns: StructureSpawn[] = [];

  constructor(roomName: string, spawnRemotes?: boolean) {
    if (spawnRemotes) {
      this.isRemoteCreep = true;
    }
    this.spawnRoom = Game.rooms[roomName];
    const roomMemory = IRoomMemory.Get(roomName).data as RoomMemory;
    const roomsToCheck = !spawnRemotes
      ? [roomName]
      : Object.keys(roomMemory.remoteRooms);
    this.roomNames = roomsToCheck;
    const spawnsCache = IStructureCache.GetAll(
      "",
      false,
      [roomName],
      CachePredicates.IsStructureType(STRUCTURE_SPAWN)
    );
    forEach(Object.keys(spawnsCache), (id) => {
      const spawn = Game.getObjectById<StructureSpawn | null>(id);
      if (spawn) this.spawns.push(spawn);
    });

    const jobsCache = IJobCache.GetAll(false, "", roomsToCheck);
    this.jobsCache = jobsCache;
    this.jobsMemory = IJobMemory.GetAll();

    this.creepsCache = groupBy(
      Object.values(ICreepCache.GetAll("", false)),
      (creep) => creep.type
    ) as StringMapGeneric<CreepCache[], CreepTypes>;
    this.GetMissingBodyParts();
  }

  GetRequiredAliveBodyPartsForJobs(): StringMapGeneric<BodyParts, CreepTypes> {
    const parts: StringMapGeneric<BodyParts, CreepTypes> = this
      .emptyBodyPartsPerType;

    forEach(Object.keys(parts), (type) => {
      parts[type] = mergeWith(
        parts,
        this.creepsCache[type].map((c) => c.body),
        // eslint-disable-next-line no-return-assign
        (objValue, srcValue) => (objValue += srcValue)
      );
    });

    this.aliveBodyParts = parts;
    return parts;
  }

  // GetRequiredQueuedBodyPartsForJobs(): BodyParts {
  //   let parts: BodyParts = {
  //     attack: 0,
  //     carry: 0,
  //     claim: 0,
  //     move: 0,
  //     work: 0,
  //     heal: 0,
  //     ranged_attack: 0,
  //     tough: 0,
  //   };
  //   return mergeWith(
  //     parts,
  //     this.queue.map((c) => c.body),
  //     (objValue, srcValue) => (objValue += srcValue)
  //   );
  // }

  GetRequiredBodyPartsForJobs(): StringMapGeneric<BodyParts, CreepTypes> {
    const parts: StringMapGeneric<BodyParts, CreepTypes> = this
      .emptyBodyPartsPerType;

    forOwn(this.jobsMemory, (memory, id) => {
      const cache = this.jobsCache[id];
      if (cache) {
        let amount = 0;
        let per1Lifetime = 0;
        let multiplier = 1;
        let bodyPart: BodyPartConstant = WORK;
        //   case "pioneer":
        //     requiredBodyPartCount = 5;
        //     queuedBodyPartCount = queuedPioneerBodyParts[bodyPart] || 0;
        //     aliveBodyPartCount = alivePioneerBodyParts[bodyPart] || 0;
        //     creepType = "pioneer";
        //     break;
        //   case "harvestMineral":
        //     multiplier = 5;
        //     per1Lifetime = 1500;
        //     break;
        //   case "build":
        //     per1Lifetime = 7500;
        //     break;
        //   case "withdraw":
        //     bodyPart = CARRY;
        //     multiplier = 0.1;
        //     per1Lifetime = 7500;
        //     creepType = "carry";
        //     break;
        //   case "repair":
        //     per1Lifetime = 150000;
        //     break;
        switch (cache.type) {
          case "HarvestSource":
            bodyPart = CreepSpawning.GetBodyPartForJobType(cache.type);
            amount = 15 * 1000;
            per1Lifetime = 3000;
            multiplier = 2;
            break;
          case "TransferSpawn":
            bodyPart = CreepSpawning.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            per1Lifetime = 75000;
            multiplier = 0.002;
            break;
          case "TransferStructure":
            bodyPart = CreepSpawning.GetBodyPartForJobType(cache.type);
            amount = memory.amountToTransfer ?? 0;
            per1Lifetime = 7500;
            multiplier = 0.1;
            break;
          // skip default case
        }
        const bodyPartsToBeAdded = Math.ceil(
          amount / (per1Lifetime * multiplier)
        );
        parts[CreepSpawning.GetCreepType(cache.type)][
          bodyPart
        ] += bodyPartsToBeAdded;
      }
    });

    return parts;
  }

  static GetBodyPartForJobType(type: JobTypes): BodyPartConstant {
    switch (type) {
      case "HarvestSource":
        return WORK;
      case "TransferSpawn":
      case "TransferStructure":
        return CARRY;
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

  static GetCreepType(type: JobTypes): CreepTypes {
    switch (type) {
      case "HarvestSource":
        return "miner";
      case "TransferSpawn":
        return "worker";
      case "TransferStructure":
        return "transferer";
      default:
        return "worker";
    }
  }

  GetMissingBodyParts(): void {
    const aliveBodyParts = this.GetRequiredAliveBodyPartsForJobs();
    const requiredBodyParts = this.GetRequiredBodyPartsForJobs();
    const missingBodyPartsPerType = this.emptyBodyPartsPerType;

    forEach(Object.keys(this.emptyBodyPartsPerType), (type) => {
      const missingBodyParts: BodyParts = this.emptyBodyParts;
      forEach(Object.keys(this.emptyBodyParts), (part) => {
        missingBodyParts[part] = Math.ceil(
          requiredBodyParts[part] - aliveBodyParts[part]
        );
      });
      missingBodyPartsPerType[type] = missingBodyParts;
    });

    this.missingBodyParts = missingBodyPartsPerType;
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

  SetupCreepMemory(creep: SpawningObject, executer?: string): boolean {
    ICreepMemory.Create(
      creep.name,
      new ICreepMemory().Generate(this.isRemoteCreep)
    );
    ICreepCache.Create(
      creep.name,
      ICreepCache.Generate(
        executer ?? creep.type,
        CreepSpawning.ConvertBodyToStringMap(creep.body),
        IRoomHelper.GetMiddlePosition(this.spawnRoom.name),
        creep.type
      )
    );
    return true;
  }

  RequestCreep(type: CreepTypes): SpawningObject | undefined {
    const creep = this.CreateCreep(type);
    const spawned = this.SpawnCreep(creep);
    if (spawned) {
      return creep;
    }
    return undefined;
  }

  GenerateBody(type: CreepTypes): BodyPartConstant[] {
    const maxCost =
      this.spawnRoom.energyCapacityAvailable / 2 > 300
        ? this.spawnRoom.energyCapacityAvailable / 2
        : 300;
    const defaultIteratee = this.defaultIteratee[type];
    const loopIteratee = this.loopIteratee[type];
    const maxCount =
      defaultIteratee.maxLoopCount * defaultIteratee.reqBodyPartPerLoop +
      loopIteratee.maxLoopCount * loopIteratee.reqBodyPartPerLoop;

    // TODO: Get different body for remote creeps (this.isRemoteCreep)
    let { body } = defaultIteratee;
    let currentCost = defaultIteratee.cost;
    let i = defaultIteratee.reqBodyPartPerLoop;
    while (
      body.length + loopIteratee.body.length < 50 &&
      currentCost + loopIteratee.cost < maxCost &&
      i + loopIteratee.reqBodyPartPerLoop < maxCount
    ) {
      body = body.concat(loopIteratee.body);
      currentCost += loopIteratee.cost;
      i += loopIteratee.reqBodyPartPerLoop;
    }

    return body;
  }

  GetCreepName(type: string): string {
    return `${type}-${this.spawnRoom.name}-${Game.time}`;
  }

  CreateCreep(type: CreepTypes): SpawningObject {
    const name = this.GetCreepName(type);
    const creep: SpawningObject = {
      name,
      executer: this.spawnRoom.name,
      type,
      body: this.GenerateBody(type),
    };
    return creep;
  }

  GetNextCreepTypeToSpawn(): CreepTypes | undefined {
    const scores: StringMapGeneric<number, CreepTypes> = {
      miner: 0,
      worker: 0,
      transferer: 0,
    };

    forOwn(scores, (value, key) => {
      const creepType = key as CreepTypes;
      const bodyPart = CreepSpawning.GetBodyPartForCreepType(creepType);
      const aliveBodyPartCount = this.aliveBodyParts[creepType][bodyPart];
      const missingBodyPartCount = this.missingBodyParts[creepType][bodyPart];
      value = missingBodyPartCount / aliveBodyPartCount;
    });

    const bestScore = reduce(scores, (max, score) =>
      max > score ? max : score
    );
    const type = findKey(scores, (score) => score === bestScore) as
      | CreepTypes
      | undefined;

    return type;
  }

  UpdateMissingBodyParts(type: CreepTypes, body: BodyPartConstant[]): void {
    switch (type) {
      case "miner":
      case "worker":
        this.missingBodyParts[type].work += (
          body.find((part) => part === WORK) ?? []
        ).length;
        break;
      case "transferer":
        this.missingBodyParts[type].carry += (
          body.find((part) => part === CARRY) ?? []
        ).length;
        break;
      default:
        break;
    }
  }

  SpawnCreep(creep: SpawningObject): boolean {
    const spawn = this.spawns[0];
    const result = spawn.spawnCreep(creep.body, creep.name);
    if (result === OK) {
      const job = IJob.FindNewJob("", creep.type, this.roomNames);
      const executer = job ? job.job.executer : undefined;
      this.SetupCreepMemory(creep, executer);
      this.UpdateMissingBodyParts(creep.type, creep.body);
      this.spawns.shift();
      return true;
    }
    return false;
  }

  SpawnCreeps(): boolean {
    if (this.spawns.length === 0) return false;
    const nextType = this.GetNextCreepTypeToSpawn();
    if (nextType) {
      const creep = this.CreateCreep(nextType);
      const spawned = this.SpawnCreep(creep);
      if (spawned) {
        return this.SpawnCreeps();
      }
    } else return true;

    return false;
  }
}
