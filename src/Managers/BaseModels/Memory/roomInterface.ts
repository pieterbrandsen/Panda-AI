import { clone } from 'lodash';
import BaseMemory from './interface';
interface IRoomMemory {
    Validate(data:StringMap<RoomMemory>)
    ValidateSingle(data:RoomMemory)
    Generate():RoomMemory
    Get(id:string):CRUDResult<RoomMemory>;
    Create(id:string, data:RoomMemory):CRUDResult<RoomMemory>;
    Update(id:string, data:RoomMemory):CRUDResult<RoomMemory>;
    Delete(id:string, data:RoomMemory):CRUDResult<RoomMemory>;
}

export default class extends BaseMemory implements IRoomMemory {
    private memoryType:MemoryTypes = "Room";
    Validate(data: StringMap<RoomMemory>) {
        return super.Validate(data,this.memoryType);
    }
    ValidateSingle(data: RoomMemory) {
        return super.ValidateSingle(data,this.memoryType);
    }
        /**
     * Create an new object of this type
     */
    Generate(): RoomMemory {
        return {
            version: super.MinimumMemoryVersion(this.memoryType),
        };
    }
    Get(id: string): CRUDResult<RoomMemory> {
        const data = clone(Memory.RoomsData.data[id]);
        return { success: data ? true: false, data };
    }
    Create(id: string, data: RoomMemory): CRUDResult<RoomMemory> {
        const dataAtId = this.Get(id);
        if (dataAtId.success) {
            return { success: false, data: dataAtId.data };
        }
        const result = this.Update(id, data);
        return { success: result.success, data: clone(result.data) };
    }
    Update(id: string, data: RoomMemory): CRUDResult<RoomMemory> {
        Memory.RoomsData.data[id] = data;
        return { success: true, data };
    }
    Delete(id: string): CRUDResult<RoomMemory> {
        delete Memory.RoomsData.data[id];
        return { success: true, data: undefined };
    }
}
