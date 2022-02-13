import { forEach } from "lodash";

export default function HandleAllShardActions(): void {
  const shardNames = ["shard0", "shard1", "shard2", "shard3"];
  if (!Game.shard.name.includes("shard")) return;

  const spawnNewCreep = () => {
    const spawn = Game.spawns["TEST!"];
    if (!spawn) return;

    const lastShardIndex = shardNames.indexOf(
      global.lastShardTarget ?? shardNames[shardNames.length - 1]
    );
    const shardTarget =
      lastShardIndex === shardNames.length - 1
        ? shardNames[0]
        : shardNames[lastShardIndex + 1];
    const spawnResult = spawn.spawnCreep([MOVE], `${shardTarget}-${Game.time}`);
    if (spawnResult === OK || spawnResult === ERR_NAME_EXISTS) {
      global.lastShardTarget = shardTarget;
    }
  };
  const moveToTarget = (
    creep: Creep,
    targetPos: RoomPosition
  ): ScreepsReturnCode | undefined => {
    if (!creep.pos.inRangeTo(targetPos, 0)) {
      return creep.moveTo(targetPos);
    }

    creep.room.createConstructionSite(2, 2, STRUCTURE_ROAD);
    return undefined;
  };
  forEach(shardNames, (shardName, index) => {
    if (Game.time % 100 === 0 && index === 0) {
      spawnNewCreep();
    }
    let loggedOrders = false;

    const creeps = Object.values(Game.creeps).filter((c) =>
      c.name.includes(shardName)
    );
    forEach(creeps, (creep) => {
      if (Game.shard.name === "shard0" && index === 0) {
        moveToTarget(creep, Game.flags.shard0.pos);
      } else if (Game.shard.name === "shard0" && index === 1) {
        moveToTarget(creep, Game.flags.shard1.pos);
      } else if (index === 2) {
        if (Game.shard.name === "shard0") {
          moveToTarget(creep, Game.flags.shard1.pos);
        } else if (Game.shard.name === "shard1") {
          moveToTarget(creep, Game.flags.shard2.pos);
        }
      } else if (index === 3) {
        if (Game.shard.name === "shard0") {
          moveToTarget(creep, Game.flags.shard1.pos);
        } else if (Game.shard.name === "shard1") {
          moveToTarget(creep, Game.flags.shard2.pos);
        } else if (Game.shard.name === "shard2") {
          moveToTarget(creep, Game.flags.shard3.pos);
        }
      }

      if (Game.shard.name === shardName) {
        const orders = JSON.stringify(Game.market.getAllOrders());
        if (!loggedOrders && Game.time % 100 === 0) {
          console.log(orders);
          loggedOrders = true;
        }
        creep.say(creep.name);
      }
    });
  });
}
