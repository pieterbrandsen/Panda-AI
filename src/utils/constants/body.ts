export const DefaultIteratee: BodyIterators = {
  pioneer: {
    body: [],
    cost: 0,
    reqBodyPartPerLoop: 0,
  },
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
  transfer: {
    body: [],
    cost: 0,
    reqBodyPartPerLoop: 0,
  },
  transferSpawning: {
    body: [],
    cost: 0,
    reqBodyPartPerLoop: 0,
  },
  withdraw: {
    body: [],
    cost: 0,
    reqBodyPartPerLoop: 0,
  },
  repair: {
    body: [],
    cost: 0,
    reqBodyPartPerLoop: 0,
  },
};
export const LoopIteratee: BodyIterators = {
  pioneer: {
    body: [WORK, CARRY, MOVE, MOVE],
    cost: 250,
    reqBodyPartPerLoop: 1,
  },
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
  transfer: {
    body: [CARRY, MOVE,MOVE],
    cost: 200,
    reqBodyPartPerLoop: 1,
  },
  withdraw: {
    body: [CARRY, MOVE,MOVE],
    cost: 200,
    reqBodyPartPerLoop: 1,
  },
  transferSpawning: {
    body: [CARRY, MOVE,MOVE],
    cost: 200,
    reqBodyPartPerLoop: 1,
  },
  repair: {
    body: [CARRY, MOVE,MOVE],
    cost: 200,
    reqBodyPartPerLoop: 1,
  },
};
