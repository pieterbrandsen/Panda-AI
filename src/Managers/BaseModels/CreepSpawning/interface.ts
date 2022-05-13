import { findKey, forEach, groupBy, reduce } from "lodash";
import CachePredicates from "../Cache/predicates";
import JobData from "../Helper/Job/memory";
import CreepData from "../Helper/Creep/memory";
import StructureData from "../Helper/Structure/memory";
import RoomData from "../Helper/Room/memory";
import BodyIterateeConstant from "./bodyConstants";
import CreepBodyPartHelper from "./bodyPartHelper";
import CreepCountHelper from "./creepCountHelper";

export default class CreepSpawning {
  private isRemoteCreep = false;

  private roomNames: string[];

  private spawnRoom: Room;

  private jobsData: StringMap<DoubleCRUDResult<JobMemory, JobCache>>;

  private creepsData: StringMapGeneric<
    DoubleCRUDResult<CreepMemory, CreepCache>[],
    CreepTypes
  >;

  private spawns: StructureSpawn[] = [];

  private missingBodyParts: StringMapGeneric<BodyParts, CreepTypes>;

  private aliveBodyParts: StringMapGeneric<BodyParts, CreepTypes>;

  private missingCreepCount: StringMapGeneric<number, CreepTypes>;

  private aliveCreepCount: StringMapGeneric<number, CreepTypes>;

  constructor(spawnRoom: string, remoteRooms?: string[]) {
    if (remoteRooms) {
      this.isRemoteCreep = true;
    }
    this.spawnRoom = Game.rooms[spawnRoom];
    const roomsToCheck = !remoteRooms ? [spawnRoom] : remoteRooms;
    this.roomNames = roomsToCheck;
    const spawnsCache = StructureData.GetAllDataBasedOnCache(
      "",
      false,
      [spawnRoom],
      CachePredicates.IsStructureType(STRUCTURE_SPAWN)
    );
    forEach(Object.keys(spawnsCache), (id) => {
      const spawn = Game.getObjectById<StructureSpawn | null>(id);
      if (spawn) this.spawns.push(spawn);
    });

    const jobsData = JobData.GetAllDataBasedOnCache("", false, roomsToCheck);
    this.jobsData = jobsData;

    this.creepsData = groupBy(
      Object.values(CreepData.GetAllDataBasedOnCache("", false, roomsToCheck)),
      (creepData) => (creepData.cache as CreepCache).type
    ) as StringMapGeneric<
      DoubleCRUDResult<CreepMemory, CreepCache>[],
      CreepTypes
    >;

    const bodyData = new CreepBodyPartHelper(
      this.creepsData,
      this.jobsData,
      this.spawnRoom
    );
    this.missingBodyParts = bodyData.missingBodyParts;
    this.aliveBodyParts = bodyData.aliveBodyParts;
    const countData = new CreepCountHelper(
      this.creepsData,
      this.jobsData,
      this.spawnRoom
    );
    this.missingCreepCount = countData.missingCreepCount;
    this.aliveCreepCount = countData.aliveCreepCount;
  }

  private SetupCreepMemory(creep: SpawningObject, executer: string): boolean {
    const data: CreepInitializationData = {
      body: CreepBodyPartHelper.ConvertBodyToStringMap(creep.body),
      executer,
      isRemoteCreep: this.isRemoteCreep,
      id: creep.name,
      pos: this.spawns[0].pos,
      type: creep.type,
      name: creep.name,
    };
    return new CreepData(creep.name).InitializeData(data).success;
  }

  private RequestCreep(type: CreepTypes): SpawningObject | undefined {
    const creep = this.CreateCreep(type);
    const spawned = this.SpawnCreep(creep);
    if (spawned) {
      return creep;
    }
    return undefined;
  }

  private GetBodyLoop(type: CreepTypes): BodyCostRoomTypes | undefined {
    if (type === "miner") {
      const { controller } = this.spawnRoom;
      if (controller && controller.level < 6 && !this.isRemoteCreep) {
        const roomData = new RoomData(this.spawnRoom.name).GetData();
        if (roomData.success) {
          const roomMemory = roomData.memory as RoomMemory;
          if (
            Object.values(roomMemory.sourceManager.sources)
              .map((s) => s.structureId === undefined)
              .filter((s) => s).length > 0
          ) {
            return BodyIterateeConstant[type].starter;
          }
        }
      }
    }

    return !this.isRemoteCreep
      ? BodyIterateeConstant[type].owned
      : BodyIterateeConstant[type].remote;
  }

  private GenerateBody(type: CreepTypes): BodyPartConstant[] {
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

  private GetCreepName(type: string): string {
    return `${type}-${this.spawnRoom.name}-${Game.time}`;
  }

  private CreateCreep(type: CreepTypes): SpawningObject {
    const name = this.GetCreepName(type);
    const creep: SpawningObject = {
      name,
      type,
      body: this.GenerateBody(type),
    };
    return creep;
  }

  private GetNextCreepTypeToSpawn(): CreepTypes | undefined {
    const scores: StringMapGeneric<number, CreepTypes> = {
      miner: 0,
      worker: 0,
      transferer: 0,
      claimer: 0,
      extractor: 0,
    };

    forEach(Object.keys(scores), (key) => {
      const creepType = key as CreepTypes;
      const bodyPart = CreepBodyPartHelper.GetBodyPartForCreepType(creepType);
      const aliveBodyPartCount = this.aliveBodyParts[creepType][bodyPart];
      const missingBodyPartCount = this.missingBodyParts[creepType][bodyPart];
      const aliveCreepCount = this.aliveCreepCount[creepType];
      const missingCreepCount = this.missingCreepCount[creepType];

      // console.log(
      //   key,
      //   aliveCreepCount,
      //   missingCreepCount,
      //   aliveBodyPartCount,
      //   missingBodyPartCount
      // );

      if (aliveCreepCount < 2 && creepType === "miner") {
        scores[creepType] = 999;
      } else if (aliveCreepCount < 1 && creepType === "transferer") {
        scores[creepType] = 999;
      } else if (missingBodyPartCount <= 0 || missingCreepCount <= 0) {
        scores[key] = 0;
      } else if (missingBodyPartCount === 0 || aliveBodyPartCount === 0) {
        scores[creepType] = missingBodyPartCount > 0 ? missingBodyPartCount : 0;
      } else {
        scores[creepType] = missingBodyPartCount / aliveBodyPartCount;
      }
    });

    // console.log("-----------------------------------");

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

  private UpdateMissingBodyParts(
    type: CreepTypes,
    body: BodyPartConstant[]
  ): void {
    switch (type) {
      case "miner":
      case "extractor":
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

  static GetBodyCost(body: BodyPartConstant[]): number {
    let cost = 0;
    forEach(body, (part) => {
      cost += BODYPART_COST[part];
    });
    return cost;
  }

  private SpawnCreep(creep: SpawningObject): boolean {
    if (creep.body.length === 0) return false;
    const spawn = this.spawns[0];
    creep.body = CreepSpawning.SortBody(creep.body);
    const { executer } = Object.values(this.jobsData)[0].cache as JobCache;
    const result = spawn.spawnCreep(creep.body, creep.name);
    if (result === OK) {
      this.SetupCreepMemory(creep, executer);
      this.UpdateMissingBodyParts(creep.type, creep.body);
      this.spawns.shift();
      Memory.updateCreepNames.push(creep.name);
      global.RoomsData[this.spawnRoom.name].stats.spawnEnergyOutgoing[
        creep.type
      ] += CreepSpawning.GetBodyCost(creep.body);
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
