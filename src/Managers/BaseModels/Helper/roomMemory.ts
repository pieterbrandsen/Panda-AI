import IRoomMemory from "../Memory/RoomInterface";
import IRoomCache from "../Cache/RoomInterface";
interface IRoomHelper {}


export default class implements IRoomHelper {
    static GetMemory(id:string): DoubleCRUDResult<RoomMemory,RoomCache> {
        const result: DoubleCRUDResult<RoomMemory,RoomCache> = {success:false, memory:undefined, cache:undefined};
        const memoryResult = IRoomMemory.Get(id);
        if (result.success) {
            result.success = true;
            result.memory = memoryResult.data;
        }
        const cacheResult = IRoomCache.Get(id);
        if (result.success) {
            result.success = true;
            result.cache = cacheResult.data;
        }
        return result;
    }

    static CreateMemory(id:string, memory:RoomMemory, cache:RoomCache): DoubleCRUDResult<RoomMemory,RoomCache> {
        const result: DoubleCRUDResult<RoomMemory,RoomCache> = {success:false, memory:undefined, cache:undefined};

        const memoryResult = IRoomMemory.Create(id, memory)
        if (memoryResult.success) {
            result.memory = memoryResult.data;
            result.success = true;
        }

        const cacheResult = IRoomCache.Create(id, cache);
        if (cacheResult.success) {
            result.cache = cacheResult.data;
            result.success = true;
        }

        return result;
    }
    static DeleteMemory(id:string, isMemory:boolean, isCache:boolean): DoubleCRUDResult<RoomMemory,RoomCache> {
        const result: DoubleCRUDResult<RoomMemory,RoomCache> = {success:false, memory:undefined, cache:undefined};
        if (isMemory) {
            const deleteResult = IRoomMemory.Delete(id);
            if (deleteResult.success) {
                result.success = true;
                result.memory = deleteResult.data;
            }
        }
        if (isCache) {
            const deleteResult = IRoomCache.Delete(id);
            if (deleteResult.success) {
                result.success = true;
                result.cache = deleteResult.data;
            }
        }
        return result;
        }
    static UpdateMemory(id:string, memory?:RoomMemory, cache?:RoomCache): DoubleCRUDResult<RoomMemory,RoomCache> {
        const result: DoubleCRUDResult<RoomMemory,RoomCache> = {success:false, memory:undefined, cache:undefined};
    
    if (memory) {
        const updateResult = IRoomMemory.Update(id, memory);
        if (updateResult.success) {
          result.success = true;
          result.memory = updateResult.data;
        }
    }
        if (cache) {
            const updateResult = IRoomCache.Update(id, cache);
            if (updateResult.success) {
              result.success = true;
              result.cache = updateResult.data;
            }
        } 

        return result;
    }
    
    static Initialize(data:RoomInitializationData): DoubleCRUDResult<RoomMemory,RoomCache> {
    const id = data.room.name;
    const result: DoubleCRUDResult<RoomMemory,RoomCache> = {success:false, memory:undefined, cache:undefined};
        const memoryResult = IRoomMemory.Initialize(id,data.room,data.remoteRooms);
        if (memoryResult.success) {
            result.success = true;
            result.memory = memoryResult.data;
        }
        const cacheResult = IRoomCache.Initialize(id);
        if (cacheResult.success) {
            result.success = true;
            result.cache = cacheResult.data;
        }
        return result;
    }
}