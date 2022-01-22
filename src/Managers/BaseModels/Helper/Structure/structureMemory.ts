import IStructureMemory from "../../Memory/structureInterface";
import IStructureCache from "../../Cache/structureInterface";

interface IStructureHelper {}

export default class implements IStructureHelper {
  static GetMemory(
    id: string
  ): DoubleCRUDResult<StructureMemory, StructureCache> {
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = IStructureMemory.Get(id);
    if (result.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = IStructureCache.Get(id);
    if (result.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }

  static CreateMemory(
    id: string,
    memory: StructureMemory,
    cache: StructureCache
  ): DoubleCRUDResult<StructureMemory, StructureCache> {
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryResult = IStructureMemory.Create(id, memory);
    if (memoryResult.success) {
      result.memory = memoryResult.data;
      result.success = true;
    }

    const cacheResult = IStructureCache.Create(id, cache);
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
  ): DoubleCRUDResult<StructureMemory, StructureCache> {
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    if (isMemory) {
      const deleteResult = IStructureMemory.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.memory = deleteResult.data;
      }
    }
    if (isCache) {
      const deleteResult = IStructureCache.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.cache = deleteResult.data;
      }
    }
    return result;
  }

  static UpdateMemory(
    id: string,
    memory?: StructureMemory,
    cache?: StructureCache
  ): DoubleCRUDResult<StructureMemory, StructureCache> {
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    if (memory) {
      const updateResult = IStructureMemory.Update(id, memory);
      if (updateResult.success) {
        result.success = true;
        result.memory = updateResult.data;
      }
    }
    if (cache) {
      const updateResult = IStructureCache.Update(id, cache);
      if (updateResult.success) {
        result.success = true;
        result.cache = updateResult.data;
      }
    }

    return result;
  }

  static Initialize(
    data: StructureInitializationData
  ): DoubleCRUDResult<StructureMemory, StructureCache> {
    const { id } = data.structure;
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = IStructureMemory.Initialize(id);
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = IStructureCache.Initialize(
      id,
      data.structure,
      data.executer
    );
    if (cacheResult.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }
}
