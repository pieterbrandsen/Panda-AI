import { clone } from 'lodash';
import BaseMemory from './interface';
interface ICreepMemory {
    Validate(data:StringMap<CreepMemory>)
    ValidateSingle(data:CreepMemory)
    Generate():CreepMemory;
    Get(id:string):CRUDResult<CreepMemory>;
    Create(id:string, data:CreepMemory):CRUDResult<CreepMemory>;
    Update(id:string, data:CreepMemory):CRUDResult<CreepMemory>;
    Delete(id:string, data:CreepMemory):CRUDResult<CreepMemory>;
}   


export default class extends BaseMemory implements ICreepMemory {
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
    Get(id: string): CRUDResult<CreepMemory> {
        const data = clone(Memory.CreepsData.data[id]);
        return { success: data ? true: false, data };
    }
    Create(id: string, data: CreepMemory): CRUDResult<CreepMemory> {
        const dataAtId = this.Get(id);
        if (dataAtId.success) {
            return { success: false, data: dataAtId.data };
        }
        const result = this.Update(id, data);
        return { success: result.success, data: clone(result.data) };
    }
    Update(id: string, data: CreepMemory): CRUDResult<CreepMemory> {
        Memory.CreepsData.data[id] = data;
        return { success: true, data };
    }
    Delete(id: string): CRUDResult<CreepMemory> {
        delete Memory.CreepsData.data[id];
        return { success: true, data: undefined };
    }
}
