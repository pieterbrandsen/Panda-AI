import Memory from './interface';
interface IRoomMemory {
    Validate(data:StringMap<RoomMemory>)
    ValidateSingle(data:RoomMemory)
    CreateObject():RoomMemory
}

export default class extends Memory implements IRoomMemory {
    private memoryType:MemoryTypes = "Room";
    Validate(data: StringMap<RoomMemory>) {
        return super.Validate(data,this.memoryType);
    }
    ValidateSingle(data: RoomMemory) {
        return super.ValidateSingle(data,this.memoryType);
    }
    CreateObject(): RoomMemory {
        return {
            version: super.MinimumMemoryVersion(this.memoryType),
        };
    }
}
