export const DefaultIteratee: BodyIterators = {
  harvestMineral: {
    body: [],
    cost: 0,
    reqBodyPartPerLoop: 0,
  },
  harvestSource: {
    body: [],
    cost: 0,
    reqBodyPartPerLoop: 0,
  },
  build: {
    body: [],
    cost: 0,
    reqBodyPartPerLoop: 0,
  },
  pioneer: {
    body: [],
    cost: 0,
    reqBodyPartPerLoop: 0,
  },
};
export const LoopIteratee: BodyIterators = {
  harvestMineral: {
    body: [WORK, CARRY, MOVE],
    cost: 200,
    reqBodyPartPerLoop: 1,
  },
  harvestSource: {
    body: [WORK, CARRY, MOVE],
    cost: 200,
    reqBodyPartPerLoop: 1,
  },
  build: {
    body: [WORK, CARRY, MOVE],
    cost: 200,
    reqBodyPartPerLoop: 1,
  },
  pioneer: {
    body: [WORK, CARRY, MOVE, MOVE],
    cost: 250,
    reqBodyPartPerLoop: 1,
  },
};
