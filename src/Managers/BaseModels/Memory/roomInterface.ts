import Memory from './interface';
interface IRoomMemory {
    Validate(data:StringMap<RoomMemory>)
}

export default class extends Memory implements IRoomMemory {
    private memoryType:MemoryTypes = "Room";
    Validate(data: StringMap<RoomMemory>) {
        return super.Validate(data,this.memoryType);
    }
    
}
