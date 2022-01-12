import Memory from './interface';
interface IStructureMemory {
    Validate(data:StringMap<StructureMemory>)
}

export default class extends Memory implements IStructureMemory {
    private memoryType:MemoryTypes = "Structure";
    Validate(data: StringMap<StructureMemory>) {
        return super.Validate(data,this.memoryType);
    }
    
}
