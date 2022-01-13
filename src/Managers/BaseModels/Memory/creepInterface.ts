import Memory from './interface';
interface ICreepMemory {
    Validate(data:StringMap<CreepMemory>)
    ValidateSingle(data:CreepMemory)
    Generate():CreepMemory
}   


export default class extends Memory implements ICreepMemory {
    private memoryType:MemoryTypes = "Creep";
    Validate(data: StringMap<CreepMemory>) {
        return super.Validate(data,this.memoryType);
    }
    ValidateSingle(data: CreepMemory) {
        return super.ValidateSingle(data,this.memoryType);
    }
    Generate(): CreepMemory {
        return {
            version: super.MinimumMemoryVersion(this.memoryType),
        };
    }
}
