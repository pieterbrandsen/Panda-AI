import Memory from './interface';
interface IStructureMemory {
    Validate(data:StringMap<StructureMemory>)
    ValidateSingle(data:StructureMemory)
    CreateObject():StructureMemory
}

export default class extends Memory implements IStructureMemory {
    private memoryType:MemoryTypes = "Structure";
    Validate(data: StringMap<StructureMemory>) {
        return super.Validate(data,this.memoryType);
    }
    ValidateSingle(data: StructureMemory) {
        return super.ValidateSingle(data,this.memoryType);
    }
    CreateObject(): StructureMemory {
        return {
            version: super.MinimumMemoryVersion(this.memoryType),
        };
    }
}
