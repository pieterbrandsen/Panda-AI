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
        body: [WORK, CARRY, MOVE, MOVE],
        cost: 250,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 1,
      },
      loop: {
        body: [WORK, CARRY, MOVE],
        cost: 150,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 4,
      },
    },
    remote: {
      default: {
        body: [WORK, CARRY, MOVE, MOVE],
        cost: 300,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 1,
      },
      loop: {
        body: [WORK, CARRY, MOVE],
        cost: 200,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 4,
      },
    },
  },
  claimer: {
    owned: {
      default: {
        body: [WORK, CARRY, MOVE, MOVE],
        cost: 250,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 1,
      },
      loop: {
        body: [WORK, CARRY, MOVE],
        cost: 150,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 4,
      },
    },
    remote: {
      default: {
        body: [CLAIM, MOVE, MOVE],
        cost: 700,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 1,
      },
      loop: {
        body: [CLAIM, MOVE, MOVE],
        cost: 700,
        reqBodyPartPerLoop: 1,
        maxLoopCount: 4,
      },
    },
  },
};

export default bodyIteratee;
