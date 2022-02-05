import { forEach } from "lodash";

export default function HandleAllShardActions(): void {
  const shardNames = ["shard0", "shard1", "shard2", "shard3"];
  if (!Game.shard.name.includes("shard")) return;

  const spawnNewCreep = () => {
    Object.values(Game.spawns).forEach((spawn) => {
      const lastShardIndex = shardNames.indexOf(
        global.lastShardTarget ?? shardNames[shardNames.length - 1]
      );
      const shardTarget =
        lastShardIndex === shardNames.length - 1
          ? shardNames[0]
          : shardNames[lastShardIndex + 1];
      console.log(lastShardIndex, shardTarget, global.lastShardTarget);
      if (spawn.spawnCreep([MOVE], shardTarget))
        global.lastShardTarget = shardTarget;
    });
  };
  const moveToTarget = (
    creep: Creep,
    targetPos: RoomPosition
  ): ScreepsReturnCode | undefined => {
    if (!creep.pos.inRangeTo(targetPos, 0)) {
      return creep.moveTo(targetPos);
    }
    return undefined;
  };
  forEach(shardNames, (shardName, index) => {
    if (Game.time % 200 === 0) {
      spawnNewCreep();
    }

    const creep = Game.creeps[shardName];
    if (creep) {
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
        // RawMemory.segments[1] = JSON.stringify({test:shardName})
        // console.log(Game.market.getAllOrders())
      }
      creep.say(creep.name);
    }
  });
}
