const bodyIteratee: StringMapGeneric<CreepBodyIteratee, CreepTypes> = {
  transferer: {
    owned: {
      default: {
        body: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        cost: 300,
        reqBodyPartPerLoop: 3,
        maxLoopCount: 1,
      },
      loop: {
        body: [CARRY, MOVE],
        cost: 100,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 99,
      },
    },
    remote: {
      default: {
        body: [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        cost: 500,
        reqBodyPartPerLoop: 5,
        maxLoopCount: 1,
      },
      loop: {
        body: [CARRY, MOVE],
        cost: 100,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 99,
      },
    },
  },
  worker: {
    owned: {
      default: {
        body: [WORK, MOVE, CARRY, MOVE, CARRY],
        cost: 300,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 1,
      },
      loop: {
        body: [WORK, MOVE, CARRY],
        cost: 200,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 10,
      },
    },
    remote: {
      default: {
        body: [WORK, MOVE, CARRY, MOVE, CARRY],
        cost: 300,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 1,
      },
      loop: {
        body: [WORK, MOVE, CARRY],
        cost: 200,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 15,
      },
    },
  },
  miner: {
    owned: {
      default: {
        body: [WORK, WORK, MOVE],
        cost: 250,
        reqBodyPartPerLoop: 2,
        maxLoopCount: 1,
      },
      loop: {
        body: [WORK, MOVE],
        cost: 150,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 4,
      },
    },
    remote: {
      default: {
        body: [WORK, WORK, MOVE],
        cost: 250,
        reqBodyPartPerLoop: 2,
        maxLoopCount: 1,
      },
      loop: {
        body: [WORK, MOVE],
        cost: 150,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 4,
      },
    },
  },
};

export default bodyIteratee;
