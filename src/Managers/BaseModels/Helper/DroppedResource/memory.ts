import { forEach } from "lodash";
import DroppedResourceMemoryData from "../../Memory/droppedResource";
import DroppedResourceCacheData from "../../Cache/droppedResource";

export default class DroppedResourceDataHelper {
  static GetDroppedResourceId(id: string): string {
    return id;
  }

  static GetMemory(
    id: string
  ): DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> {
    const result: DoubleCRUDResult<
      DroppedResourceMemory,
      DroppedResourceCache
    > = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = DroppedResourceMemoryData.Get(id);
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = DroppedResourceCacheData.Get(id);
    if (cacheResult.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }

  static CreateMemory(
    id: string,
    memory: DroppedResourceMemory,
    cache: DroppedResourceCache
  ): DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> {
    const result: DoubleCRUDResult<
      DroppedResourceMemory,
      DroppedResourceCache
    > = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryResult = DroppedResourceMemoryData.Create(id, memory);
    if (memoryResult.success) {
      result.memory = memoryResult.data;
      result.success = true;
    }

    const cacheResult = DroppedResourceCacheData.Create(id, cache);
    if (cacheResult.success) {
      result.cache = cacheResult.data;
      result.success = true;
    }

    return result;
  }

  static DeleteMemory(
    id: string,
    isMemory: boolean,
    isCache: boolean
  ): DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> {
    const result: DoubleCRUDResult<
      DroppedResourceMemory,
      DroppedResourceCache
    > = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    if (isMemory) {
      const deleteResult = DroppedResourceMemoryData.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.memory = deleteResult.data;
      }
    }
    if (isCache && result.success) {
      const deleteResult = DroppedResourceCacheData.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.cache = deleteResult.data;
      }
    }
    return result;
  }

  static UpdateMemory(
    id: string,
    memory?: DroppedResourceMemory,
    cache?: DroppedResourceCache
  ): DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> {
    const result: DoubleCRUDResult<
      DroppedResourceMemory,
      DroppedResourceCache
    > = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    if (memory) {
      const updateResult = DroppedResourceMemoryData.Update(id, memory);
      if (updateResult.success) {
        result.success = true;
        result.memory = updateResult.data;
      }
    }
    if (cache && result.success) {
      const updateResult = DroppedResourceCacheData.Update(id, cache);
      if (updateResult.success) {
        result.success = true;
        result.cache = updateResult.data;
      }
    }

    return result;
  }

  static Initialize(
    data: DroppedResourceInitializationData
  ): DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> {
    const id = this.GetDroppedResourceId(data.resource.id);
    const result: DoubleCRUDResult<
      DroppedResourceMemory,
      DroppedResourceCache
    > = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = DroppedResourceMemoryData.Initialize(id);
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = DroppedResourceCacheData.Initialize(
      id,
      data.executer,
      data.resource.pos,
      data.resource.resourceType
    );
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
    predicateMemory?: Predicate<DroppedResourceMemory>,
    predicateCache?: Predicate<DroppedResourceCache>
  ): StringMap<DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache>> {
    const result: StringMap<
      DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache>
    > = {};
    const ids = Object.keys(
      isMemory
        ? DroppedResourceMemoryData.GetAll(predicateMemory)
        : DroppedResourceCacheData.GetAll(
            executer,
            getOnlyExecuterJobs,
            roomsToCheck,
            predicateCache
          )
    );
    forEach(ids, (id) => {
      const memoryResult = DroppedResourceMemoryData.Get(id);
      const cacheResult = DroppedResourceCacheData.Get(id);
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
    predicate?: Predicate<DroppedResourceMemory>
  ): StringMap<DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache>> {
    return this.GetAll(true, undefined, undefined, undefined, predicate);
  }

  static GetAllBasedOnCache(
    executer = "",
    getOnlyExecuterJobs = false,
    roomsToCheck?: string[],
    predicate?: Predicate<DroppedResourceCache>
  ): StringMap<DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache>> {
    return this.GetAll(
      false,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      undefined,
      predicate
    );
  }
}
