import { findKey, forEach, groupBy, reduce } from "lodash";
import IJobMemory from "../Memory/jobInterface";
import IJobCache from "../Cache/jobInterface";
import CachePredicates from "../Cache/predicates";
import ICreepCache from "../Cache/creepInterface";
import IStructureCache from "../Cache/structureInterface";
import ICreepMemory from "../Helper/Creep/creepMemory";
import bodyIteratee from "./bodyConstants";
import ICreepBodyPartHelper from "./bodyPartHelper";
import ICreepCountHelper from "./creepCountHelper";

interface ICreepSpawning {}

export default class CreepSpawning implements ICreepSpawning {
  isRemoteCreep = false;

  roomNames: string[];

  spawnRoom: Room;

  jobsMemory: StringMap<JobMemory>;

  jobsCache: StringMap<JobCache>;

  creepsCache: StringMapGeneric<CreepCache[], CreepTypes>;

  spawns: StructureSpawn[] = [];

  missingBodyParts: StringMapGeneric<BodyParts, CreepTypes>;

  aliveBodyParts: StringMapGeneric<BodyParts, CreepTypes>;

  missingCreepCount: StringMapGeneric<number, CreepTypes>;

  aliveCreepCount: StringMapGeneric<number, CreepTypes>;

  constructor(spawnRoom: string, remoteRooms?: string[]) {
    if (remoteRooms) {
      this.isRemoteCreep = true;
    }
    this.spawnRoom = Game.rooms[spawnRoom];
    const roomsToCheck = !remoteRooms ? [spawnRoom] : remoteRooms;
    this.roomNames = roomsToCheck;
    const spawnsCache = IStructureCache.GetAll(
      "",
      false,
      [spawnRoom],
      CachePredicates.IsStructureType(STRUCTURE_SPAWN)
    );
    forEach(Object.keys(spawnsCache), (id) => {
      const spawn = Game.getObjectById<StructureSpawn | null>(id);
      if (spawn) this.spawns.push(spawn);
    });

    const jobsCache = IJobCache.GetAll(false, "", roomsToCheck);
    this.jobsCache = jobsCache;

    const jobIds = Object.keys(jobsCache);
    const jobsMemory = IJobMemory.GetAll();
    this.jobsMemory = Object.keys(jobsMemory)
      .filter((key) => jobIds.includes(key))
      // eslint-disable-next-line
      .reduce((res, key) => ((res[key] = jobsMemory[key]), res), {});

    this.creepsCache = groupBy(
      Object.values(ICreepCache.GetAll("", false, roomsToCheck)),
      (creep) => creep.type
    ) as StringMapGeneric<CreepCache[], CreepTypes>;

    const bodyData = new ICreepBodyPartHelper(
      this.creepsCache,
      this.jobsMemory,
      this.jobsCache,
      this.spawnRoom
    );
    this.missingBodyParts = bodyData.missingBodyParts;
    this.aliveBodyParts = bodyData.aliveBodyParts;
    const countData = new ICreepCountHelper(
      this.creepsCache,
      this.jobsMemory,
      this.jobsCache,
      this.spawnRoom
    );
    this.missingCreepCount = countData.missingCreepCount;
    this.aliveCreepCount = countData.aliveCreepCount;
  }

  SetupCreepMemory(creep: SpawningObject, executer: string): boolean {
    const memory: CreepInitializationData = {
      body: ICreepBodyPartHelper.ConvertBodyToStringMap(creep.body),
      executer,
      isRemoteCreep: this.isRemoteCreep,
      name: creep.name,
      pos: this.spawns[0].pos,
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
    if (type === "miner") {
      const { controller } = this.spawnRoom;
      if (controller && !(controller.level > 6)) {
        return bodyIteratee[type].starter;
      }
    }

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
      claimer: 0,
    };

    forEach(Object.keys(scores), (key) => {
      const creepType = key as CreepTypes;
      const bodyPart = ICreepBodyPartHelper.GetBodyPartForCreepType(creepType);
      const aliveBodyPartCount = this.aliveBodyParts[creepType][bodyPart];
      const missingBodyPartCount = this.missingBodyParts[creepType][bodyPart];
      const aliveCreepCount = this.aliveCreepCount[creepType];
      const missingCreepCount = this.missingCreepCount[creepType];

      console.log(
        key,
        aliveCreepCount,
        missingCreepCount,
        aliveBodyPartCount,
        missingBodyPartCount
      );

      if (aliveCreepCount < 2 && creepType === "miner") {
        scores[creepType] = 999;
      } else if (missingBodyPartCount <= 0 || missingCreepCount <= 0) {
        scores[key] = 0;
      } else if (missingBodyPartCount === 0 || aliveBodyPartCount === 0) {
        scores[creepType] = missingBodyPartCount > 0 ? missingBodyPartCount : 0;
      } else {
        scores[creepType] = missingBodyPartCount / aliveBodyPartCount;
      }
    });

    console.log("-----------------------------------");

    const bestScore = reduce(scores, (max, score) =>
      max > score ? max : score
    );
    if (bestScore === undefined || bestScore === 0) {
      return undefined;
    }
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
