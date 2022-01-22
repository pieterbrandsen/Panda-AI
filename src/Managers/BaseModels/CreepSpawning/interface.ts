import { findKey, forEach, forOwn, groupBy, mergeWith, reduce } from "lodash";
import IRoomPosition from "../Helper/Room/roomPosition";
import IRoomMemory from "../Memory/roomInterface";
import IJobMemory from "../Memory/jobInterface";
import IJobCache from "../Cache/jobInterface";
import CachePredicates from "../Cache/predicates";
import ICreepCache from "../Cache/creepInterface";
import IStructureCache from "../Cache/structureInterface";
import ICreepMemory from "../Helper/Creep/creepMemory";
import bodyIteratee from "./bodyConstants";

interface ICreepSpawning {}

export default class CreepSpawning implements ICreepSpawning {
  isRemoteCreep = false;

  roomNames: string[];

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
      : Object.keys(roomMemory.remoteRooms ?? {});
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

  SetupCreepMemory(creep: SpawningObject, executer: string): boolean {
    const memory: CreepInitializationData = {
      body: CreepSpawning.ConvertBodyToStringMap(creep.body),
      executer,
      isRemoteCreep: this.isRemoteCreep,
      name: creep.name,
      pos: IRoomPosition.GetMiddlePosition(this.spawnRoom.name),
      type: creep.type,
    };
    return ICreepMemory.Initialize(memory).success;
  }

  RequestCreep(type: CreepTypes): SpawningObject | undefined {
    const creep = this.CreateCreep(type);
    const spawned = this.SpawnCreep(creep);
    if (spawned) {
      return creep;
    }
    return undefined;
  }

  GetBodyLoop(type: CreepTypes): BodyCostRoomTypes | undefined {
    return !this.isRemoteCreep
      ? bodyIteratee[type].owned
      : bodyIteratee[type].remote;
  }

  GenerateBody(type: CreepTypes): BodyPartConstant[] {
    const maxCost =
      this.spawnRoom.energyCapacityAvailable / 2 > 300
        ? this.spawnRoom.energyCapacityAvailable / 2
        : 300;

    const bodyLoop: BodyCostRoomTypes | undefined = this.GetBodyLoop(type);
    if (!bodyLoop) {
      return [];
    }
    const maxCount =
      bodyLoop.default.maxLoopCount * bodyLoop.default.reqBodyPartPerLoop +
      bodyLoop.loop.maxLoopCount * bodyLoop.loop.reqBodyPartPerLoop;

    let { body } = bodyLoop.default;
    let currentCost = bodyLoop.default.cost;
    let i = bodyLoop.default.reqBodyPartPerLoop;
    while (
      body.length + bodyLoop.loop.body.length < 50 &&
      currentCost + bodyLoop.loop.cost < maxCost &&
      i + bodyLoop.loop.reqBodyPartPerLoop < maxCount
    ) {
      body = body.concat(bodyLoop.loop.body);
      currentCost += bodyLoop.loop.cost;
      i += bodyLoop.loop.reqBodyPartPerLoop;
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

  static SortBody(body: BodyPartConstant[]): BodyPartConstant[] {
    const bodyValues: BodyParts = {
      attack: 2,
      carry: 1,
      claim: 2,
      heal: 1,
      move: 2,
      ranged_attack: 2,
      tough: 0,
      work: 1,
    };
    return body.sort((a, b) => bodyValues[a] - bodyValues[b]);
  }

  SpawnCreep(creep: SpawningObject): boolean {
    if (creep.body.length === 0) return false;
    const spawn = this.spawns[0];
    creep.body = CreepSpawning.SortBody(creep.body);
    const { executer } = Object.values(this.jobsCache)[0];
    const result = spawn.spawnCreep(creep.body, creep.name);
    if (result === OK) {
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
