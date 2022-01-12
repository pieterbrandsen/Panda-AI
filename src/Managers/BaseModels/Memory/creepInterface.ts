import Memory from './interface';
interface ICreepMemory {
    Validate(data:StringMap<CreepMemory>)
}

export default class extends Memory implements ICreepMemory {
    private memoryType:MemoryTypes = "Creep";
    Validate(data: StringMap<CreepMemory>) {
        return super.Validate(data,this.memoryType);
    }
    
}
