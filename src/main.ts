// #region Game loop
export const loop = () => {
  Object.values(Game.spawns).forEach(spawn => {
    spawn.spawnCreep([MOVE],"creep");
  });

  Object.values(Game.creeps).forEach(creep => {
    if (creep.room.controller !== undefined) creep.moveTo(creep.room.controller);
    creep.say("Hi",true);
  });

};
// #endregion