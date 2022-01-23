interface ICreepTransferRole {}

export default class implements ICreepTransferRole {
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
        else if (this.creep.store.getUsedCapacity() === 0) {
            return "empty";
        }
        const target:Structure|null = Game.getObjectById(this.jobMemory.targetId);
        if (target) {
            const result = this.creep.transfer(target,RESOURCE_ENERGY);
            switch (result) {
                case ERR_NOT_IN_RANGE:
                    this.creep.moveTo(target);
                    break;
                    case ERR_FULL:
                        return "done";
                        case ERR_NOT_ENOUGH_RESOURCES:
                            return "empty";
                            case OK:
                    break;
            }
        }
        return "continue";
    }
}