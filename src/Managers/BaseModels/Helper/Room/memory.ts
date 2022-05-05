import { forEach } from "lodash";
import RoomMemoryData from "../../Memory/room";
import RoomCacheData from "../../Cache/room";
import RoomHeapData from "../../Heap/room";

export default class RoomData extends RoomHeapData {
  protected _roomInformation: RoomInformation;

  constructor(roomInformation: RoomInformation) {
    super(roomInformation.name);
    this._roomInformation = roomInformation;
  }

  protected GetData(): DoubleCRUDResult<RoomMemory, RoomCache> {
    const { name } = this._roomInformation;
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = RoomMemoryData.Get(name);
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = RoomCacheData.Get(name);
    if (cacheResult.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }

  protected CreateData(
    memory: RoomMemory,
    cache: RoomCache
  ): DoubleCRUDResult<RoomMemory, RoomCache> {
    const { name } = this._roomInformation;
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryResult = RoomMemoryData.Create(name, memory);
    if (memoryResult.success) {
      result.memory = memoryResult.data;
      result.success = true;
    }

    const cacheResult = RoomCacheData.Create(name, cache);
    if (cacheResult.success && result.success) {
      result.cache = cacheResult.data;
      result.success = true;
    }

    return result;
  }

  protected DeleteData(
    isMemory: boolean,
    isCache: boolean
  ): DoubleCRUDResult<RoomMemory, RoomCache> {
    const { name } = this._roomInformation;
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    if (isMemory) {
      const deleteResult = RoomMemoryData.Delete(name);
      if (deleteResult.success) {
        result.success = true;
        result.memory = deleteResult.data;
      }
    }
    if (isCache && result.success) {
      const deleteResult = RoomCacheData.Delete(name);
      if (deleteResult.success) {
        result.success = true;
        result.cache = deleteResult.data;
      }
    }
    return result;
  }

  protected UpdateData(
    memory?: RoomMemory,
    cache?: RoomCache
  ): DoubleCRUDResult<RoomMemory, RoomCache> {
    const { name } = this._roomInformation;
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    if (memory) {
      const updateResult = RoomMemoryData.Update(name, memory);
      if (updateResult.success) {
        result.success = true;
        result.memory = updateResult.data;
      }
    }
    if (cache && result.success) {
      const updateResult = RoomCacheData.Update(name, cache);
      if (updateResult.success) {
        result.success = true;
        result.cache = updateResult.data;
      }
    }

    return result;
  }

  protected UpdateControllerMemory(
    data: ControllerMemory
  ): CRUDResult<ControllerMemory> {
    const { name } = this._roomInformation;
    return RoomMemoryData.UpdateControllerMemory(name, data);
  }

  protected UpdateSourceMemory(
    sourceName: string,
    data: SourceMemory
  ): CRUDResult<SourceMemory> {
    const { name } = this._roomInformation;
    return RoomMemoryData.UpdateSourceMemory(name, sourceName, data);
  }

  protected InitializeData(
    data: RoomInitializationData
  ): DoubleCRUDResult<RoomMemory, RoomCache> {
    const { name } = this._roomInformation;
    const result: DoubleCRUDResult<RoomMemory, RoomCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = RoomMemoryData.Initialize(
      name,
      data.room,
      data.remoteRooms
    );
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = RoomCacheData.Initialize(name);
    if (cacheResult.success && result.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }

    return result;
  }

  public static GetAllData(
    isMemory: boolean,
    executer?: string,
    getOnlyExecuterJobs?: boolean,
    roomsToCheck?: string[],
    predicateMemory?: Predicate<RoomMemory>,
    predicateCache?: Predicate<RoomCache>
  ): StringMap<DoubleCRUDResult<RoomMemory, RoomCache>> {
    const result: StringMap<DoubleCRUDResult<RoomMemory, RoomCache>> = {};
    const names = Object.keys(
      isMemory
        ? RoomMemoryData.GetAll(predicateMemory)
        : RoomCacheData.GetAll(
            executer,
            getOnlyExecuterJobs,
            roomsToCheck,
            predicateCache
          )
    );
    forEach(names, (name) => {
      const memoryResult = RoomMemoryData.Get(name);
      const cacheResult = RoomCacheData.Get(name);
      if (memoryResult.success && cacheResult.success) {
        result[name] = {
          success: true,
          memory: memoryResult.data,
          cache: cacheResult.data,
        };
      }
    });

    return result;
  }

  public static GetAllDataBasedOnMemory(
    predicate?: Predicate<RoomMemory>
  ): StringMap<DoubleCRUDResult<RoomMemory, RoomCache>> {
    return this.GetAllData(true, undefined, undefined, undefined, predicate);
  }

  static GetAllDataBasedOnCache(
    executer = "",
    getOnlyExecuterJobs = false,
    roomsToCheck?: string[],
    predicate?: Predicate<RoomCache>
  ): StringMap<DoubleCRUDResult<RoomMemory, RoomCache>> {
    return this.GetAllData(
      false,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      undefined,
      predicate
    );
  }
}
