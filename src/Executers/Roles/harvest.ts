interface ICreepHarvestRole {}

export default class implements ICreepHarvestRole {
    creep:Creep;
    creepCache:CreepCache;
    creepMemory:CreepMemory;
    jobCache:JobCache
    jobMemory:JobMemory
    constructor(creep: Creep,creepCache:CreepCache,creepMemory:CreepMemory,jobCache:JobCache,jobMemory:JobMemory) {
        this.creep = creep;
        this.creepCache = creepCache;
        this.creepMemory = creepMemory;
        this.jobCache = jobCache;
        this.jobMemory = jobMemory;
    }

    run():JobResult {
        if (this.creep.store.getFreeCapacity() === 0) {
            return "full";
        }
        const target:Source|null = Game.getObjectById(this.jobMemory.targetId);
        if (target) {
            const result = this.creep.harvest(target);
            switch (result) {
                case ERR_NOT_IN_RANGE:
                    this.creep.moveTo(target);
                    break;
                case OK:
                    break;
            }
        }

        return "continue";
    }
}