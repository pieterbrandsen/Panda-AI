import { clone } from 'lodash';
import BaseMemory from './interface';
interface IStructureMemory {
    Validate(data:StringMap<StructureMemory>)
    ValidateSingle(data:StructureMemory)
    Generate():StructureMemory
    Get(id:string):CRUDResult<StructureMemory>;
    Create(id:string, data:StructureMemory):CRUDResult<StructureMemory>;
    Update(id:string, data:StructureMemory):CRUDResult<StructureMemory>;
    Delete(id:string, data:StructureMemory):CRUDResult<StructureMemory>;
}

export default class extends BaseMemory implements IStructureMemory {
    private memoryType:MemoryTypes = "Structure";
    Validate(data: StringMap<StructureMemory>) {
        return super.Validate(data,this.memoryType);
    }
    ValidateSingle(data: StructureMemory) {
        return super.ValidateSingle(data,this.memoryType);
    }
        /**
     * Create an new object of this type
     */
    Generate(): StructureMemory {
        return {
            version: super.MinimumMemoryVersion(this.memoryType),
        };
    }
    Get(id: string): CRUDResult<StructureMemory> {
        const data = clone(Memory.StructuresData.data[id]);
        return { success: data ? true: false, data };
    }
    Create(id: string, data: StructureMemory): CRUDResult<StructureMemory> {
        const dataAtId = this.Get(id);
        if (dataAtId.success) {
            return { success: false, data: dataAtId.data };
        }
        const result = this.Update(id, data);
        return { success: result.success, data: clone(result.data) };
    }
    Update(id: string, data: StructureMemory): CRUDResult<StructureMemory> {
        Memory.StructuresData.data[id] = data;
        return { success: true, data };
    }
    Delete(id: string): CRUDResult<StructureMemory> {
        delete Memory.StructuresData.data[id];
        return { success: true, data: undefined };
    }
}
