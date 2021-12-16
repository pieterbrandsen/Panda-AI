import { countBy, sum, forEach } from "lodash";
import { DefaultCreepMemory } from "../../../utils/constants/memory";
import BodyHelper from "./helpers/body";

export default class UpdateSpawningQueue {
  /**
   * Update the queue for jobType and managerName
   * @param room - Room of manager
   * @param jobType - Type of job to spawn creeps for
   * @param managerName - Name of the manager
   */
  public static Update(
    room: Room,
    jobType: JobType,
    managerName: ManagerNames
  ): void {
    const managerCache =
      Memory.roomsData.data[room.name].managersMemory[managerName];
    const spawnCache = Memory.roomsData.data[room.name].managersMemory.spawn;

    let multiplier = 1;
    let per1Lifetime = 0;

    const alivePioneerBodyParts: BodyPartConstant[] = [];
    const aliveBodyParts = countBy(
      Object.keys(
        Object.fromEntries(
          Object.entries(managerCache.creeps).filter(
            ([key]) =>
              Memory.creepsData.data[key].manager.name === managerName &&
              Memory.creepsData.data[key].manager.roomName === room.name
          )
        )
      ).reduce<BodyPartConstant[]>(
        (bodyParts: BodyPartConstant[], name: string): BodyPartConstant[] => {
          const creep = Game.creeps[name];
          if (creep) {
            if (Memory.creepsData.data[name].creepType === "pioneer") {
              alivePioneerBodyParts.push(
                ...creep.body.map((part) => part.type)
              );
            }
            bodyParts.push(...creep.body.map((part) => part.type));
          }

          return bodyParts;
        },
        []
      )
    );

    const queuedPioneerBodyParts = countBy(
      spawnCache.queue
        .filter(
          (creep) =>
            creep.creepType === "pioneer" && creep.managerName === managerName
        )
        .map((creep) => creep.body)
        .flat()
    );
    const queuedBodyParts = countBy(
      spawnCache.queue
        .filter((creep) => creep.managerName === managerName)
        .map((creep) => creep.body)
        .flat()
    );

    let aliveBodyPartCount = 0;
    let queuedBodyPartCount = 0;
    let requiredBodyPartCount = 0;

    let creepType: CreepType = "work";
    let bodyPart: BodyPartConstant = WORK;
    switch (jobType) {
      case "pioneer":
        requiredBodyPartCount = 5;
        queuedBodyPartCount = queuedPioneerBodyParts[bodyPart] || 0;
        aliveBodyPartCount = alivePioneerBodyParts[bodyPart] || 0;
        creepType = "pioneer";
        break;
      case "harvestMineral":
        multiplier = 5;
        per1Lifetime = 1500;
        break;
      case "harvestSource":
        multiplier = 0.5;
        per1Lifetime = 3000;
        break;
      case "build":
        per1Lifetime = 7500;
        break;
      case "transfer":
      case "withdraw":
        bodyPart = CARRY;
        multiplier = 0.1;
        per1Lifetime = 7500;
        creepType = "carry";
        break;
      case "transferSpawning":
        bodyPart = CARRY;
        multiplier = 0.002;
        per1Lifetime = 75000;
        creepType = "carry";
        break;
      case "repair":
        per1Lifetime = 150000;
        break;

      // skip default case
    }

    if (jobType !== "pioneer") {
      requiredBodyPartCount =
        sum(
          managerCache.jobs
            .filter((job) => job.type === jobType)
            .map((job) => job.amountLeft)
        ) /
        (per1Lifetime * multiplier);
      queuedBodyPartCount = queuedBodyParts[bodyPart] || 0;
      aliveBodyPartCount = aliveBodyParts[bodyPart] || 0;
    }

    const missingBodyParts =
      Math.ceil(
        (requiredBodyPartCount - aliveBodyPartCount - queuedBodyPartCount) / 5
      ) * 5;
    if (missingBodyParts <= 0) return;
    const bodies = BodyHelper.Generate(room, missingBodyParts, jobType);
    forEach(bodies, (body) => {
      if (body.length > 0) {
        spawnCache.queue.push({
          body,
          bodyCost: BodyHelper.GetBodyCost(body),
          memory: DefaultCreepMemory(
            { name: managerName, roomName: room.name },
            creepType
          ),
          managerName,
          name: `${managerName}-${jobType}-${(global.totalQueuedCreeps += 1)}`,
          roomName: room.name,
          creepType,
        });
      }
    });
  }
}
