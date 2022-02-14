import { forEach } from "lodash";
import RoomMemoryData from "../../Memory/room";
import RoomCacheData from "../../Cache/room";

export default class RoomDataHelper {
  static GetId(name: string): string {
    return name;
  }

  static GetMemory(id: string): DoubleCRUDResult<RoomMemory, RoomCache> {
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = RoomMemoryData.Get(id);
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = RoomCacheData.Get(id);
    if (cacheResult.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }

  static CreateMemory(
    id: string,
    memory: RoomMemory,
    cache: RoomCache
  ): DoubleCRUDResult<RoomMemory, RoomCache> {
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryResult = RoomMemoryData.Create(id, memory);
    if (memoryResult.success) {
      result.memory = memoryResult.data;
      result.success = true;
    }

    const cacheResult = RoomCacheData.Create(id, cache);
    if (cacheResult.success && result.success) {
      result.cache = cacheResult.data;
      result.success = true;
    }

    return result;
  }

  static DeleteMemory(
    id: string,
    isMemory: boolean,
    isCache: boolean
  ): DoubleCRUDResult<RoomMemory, RoomCache> {
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    if (isMemory) {
      const deleteResult = RoomMemoryData.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.memory = deleteResult.data;
      }
    }
    if (isCache && result.success) {
      const deleteResult = RoomCacheData.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.cache = deleteResult.data;
      }
    }
    return result;
  }

  static UpdateMemory(
    id: string,
    memory?: RoomMemory,
    cache?: RoomCache
  ): DoubleCRUDResult<RoomMemory, RoomCache> {
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    if (memory) {
      const updateResult = RoomMemoryData.Update(id, memory);
      if (updateResult.success) {
        result.success = true;
        result.memory = updateResult.data;
      }
    }
    if (cache && result.success) {
      const updateResult = RoomCacheData.Update(id, cache);
      if (updateResult.success) {
        result.success = true;
        result.cache = updateResult.data;
      }
    }

    return result;
  }

  static UpdateControllerMemory(
    id: string,
    data: ControllerMemory
  ): CRUDResult<ControllerMemory> {
    return RoomMemoryData.UpdateControllerMemory(id, data);
  }

  static UpdateSourceMemory(
    roomId: string,
    sourceId: string,
    data: SourceMemory
  ): CRUDResult<SourceMemory> {
    return RoomMemoryData.UpdateSourceMemory(roomId, sourceId, data);
  }

  static Initialize(
    data: RoomInitializationData
  ): DoubleCRUDResult<RoomMemory, RoomCache> {
    const id = this.GetId(data.room.name);
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = RoomMemoryData.Initialize(
      id,
      data.room,
      data.remoteRooms
    );
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = RoomCacheData.Initialize(id);
    if (cacheResult.success && result.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }

    return result;
  }

  private static GetAll(
    isMemory: boolean,
    executer?: string,
    getOnlyExecuterJobs?: boolean,
    roomsToCheck?: string[],
    predicateMemory?: Predicate<RoomMemory>,
    predicateCache?: Predicate<RoomCache>
  ): StringMap<DoubleCRUDResult<RoomMemory, RoomCache>> {
    const result: StringMap<DoubleCRUDResult<RoomMemory, RoomCache>> = {};
    const ids = Object.keys(
      isMemory
        ? RoomMemoryData.GetAll(predicateMemory)
        : RoomCacheData.GetAll(
            executer,
            getOnlyExecuterJobs,
            roomsToCheck,
            predicateCache
          )
    );
    forEach(ids, (id) => {
      const memoryResult = RoomMemoryData.Get(id);
      const cacheResult = RoomCacheData.Get(id);
      if (memoryResult.success && cacheResult.success) {
        result[id] = {
          success: true,
          memory: memoryResult.data,
          cache: cacheResult.data,
        };
      }
    });

    return result;
  }

  static GetAllBasedOnMemory(
    predicate?: Predicate<RoomMemory>
  ): StringMap<DoubleCRUDResult<RoomMemory, RoomCache>> {
    return this.GetAll(true, undefined, undefined, undefined, predicate);
  }

  static GetAllBasedOnCache(
    executer = "",
    getOnlyExecuterJobs = false,
    roomsToCheck?: string[],
    predicate?: Predicate<RoomCache>
  ): StringMap<DoubleCRUDResult<RoomMemory, RoomCache>> {
    return this.GetAll(
      true,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      undefined,
      predicate
    );
  }
}
