import { ErrorMapper } from './errorMapper';

export const loop = ErrorMapper.wrapLoop((): void => {
  Object.values(Game.spawns).forEach(spawn => {
    spawn.spawnCreep([MOVE],"creep");
  });

  Object.values(Game.creeps).forEach(creep => {
    creep.say("Hi",true);
    if (creep.room.controller !== undefined) creep.moveTo(creep.room.controller);
  });
});