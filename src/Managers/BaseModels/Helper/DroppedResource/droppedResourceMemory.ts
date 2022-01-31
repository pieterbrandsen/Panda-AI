import IDroppedResourceMemory from "../../Memory/droppedResourceInterface";
import IDroppedResourceCache from "../../Cache/droppedResourceInterface";
import IJobs from "../../Jobs/interface";

interface IDroppedResourceHelper {}

export default class implements IDroppedResourceHelper {
  static GetDroppedResourceId(id: string): string {
    return id;
  }

  static GetMemory(id: string): DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> {
    const result: DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = IDroppedResourceMemory.Get(id);
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = IDroppedResourceCache.Get(id);
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
    const result: DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryResult = IDroppedResourceMemory.Create(id, memory);
    if (memoryResult.success) {
      result.memory = memoryResult.data;
      result.success = true;
    }

    const cacheResult = IDroppedResourceCache.Create(id, cache);
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
    const result: DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryData = IDroppedResourceMemory.Get(id);
    if (memoryData.success) {
      IJobs.Delete(id);
    }

    if (isMemory) {
      const deleteResult = IDroppedResourceMemory.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.memory = deleteResult.data;
      }
    }
    if (isCache && result.success) {
      const deleteResult = IDroppedResourceCache.Delete(id);
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
    const result: DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    if (memory) {
      const updateResult = IDroppedResourceMemory.Update(id, memory);
      if (updateResult.success) {
        result.success = true;
        result.memory = updateResult.data;
      }
    }
    if (cache && result.success) {
      const updateResult = IDroppedResourceCache.Update(id, cache);
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
    const result: DoubleCRUDResult<DroppedResourceMemory, DroppedResourceCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = IDroppedResourceMemory.Initialize(id);
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = IDroppedResourceCache.Initialize(
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
}
