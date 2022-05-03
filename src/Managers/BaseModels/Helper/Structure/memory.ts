import { forEach } from "lodash";
import StructureMemoryData from "../../Memory/structure";
import StructureCacheData from "../../Cache/structure";
import StructureHeapData from "../../Heap/structure";

export default class StructureDataHelper<S extends Structure> extends StructureHeapData {
  protected _structureInformation: StructureInformation<S>;
  constructor(structureInformation: StructureInformation<S>) {
    super(structureInformation.structure!.id);
    this._structureInformation = structureInformation;
  }

  protected GetData(
  ): DoubleCRUDResult<StructureMemory, StructureCache> {
    const id = this._structureInformation.structure!.id;
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = StructureMemoryData.Get(id);
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = StructureCacheData.Get(id);
    if (cacheResult.success && result.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }

  protected CreateData(
    memory: StructureMemory,
    cache: StructureCache
  ): DoubleCRUDResult<StructureMemory, StructureCache> {
    const id = this._structureInformation.structure!.id;
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    const memoryResult = StructureMemoryData.Create(id, memory);
    if (memoryResult.success) {
      result.memory = memoryResult.data;
      result.success = true;
    }

    const cacheResult = StructureCacheData.Create(id, cache);
    if (cacheResult.success && result.success) {
      result.cache = cacheResult.data;
      result.success = true;
    }

    return result;
  }

  protected DeleteData(
    isMemory: boolean,
    isCache: boolean
  ): DoubleCRUDResult<StructureMemory, StructureCache> {
    const id = this._structureInformation.structure!.id;
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    if (isMemory) {
      const deleteResult = StructureMemoryData.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.memory = deleteResult.data;
      }
    }
    if (isCache && result.success) {
      const deleteResult = StructureCacheData.Delete(id);
      if (deleteResult.success) {
        result.success = true;
        result.cache = deleteResult.data;
      }
    }
    return result;
  }

  protected UpdateData(
    memory?: StructureMemory,
    cache?: StructureCache
  ): DoubleCRUDResult<StructureMemory, StructureCache> {
    const id = this._structureInformation.structure!.id;
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };

    if (memory) {
      const updateResult = StructureMemoryData.Update(id, memory);
      if (updateResult.success) {
        result.success = true;
        result.memory = updateResult.data;
      }
    }
    if (cache && result.success) {
      const updateResult = StructureCacheData.Update(id, cache);
      if (updateResult.success) {
        result.success = true;
        result.cache = updateResult.data;
      }
    }

    return result;
  }

  protected InitializeData(
    data: StructureInitializationData
  ): DoubleCRUDResult<StructureMemory, StructureCache> {
    const { id } = data.structure;
    const result: DoubleCRUDResult<StructureMemory, StructureCache> = {
      success: false,
      memory: undefined,
      cache: undefined,
    };
    const memoryResult = StructureMemoryData.Initialize(id, data.isSource);
    if (memoryResult.success) {
      result.success = true;
      result.memory = memoryResult.data;
    }
    const cacheResult = StructureCacheData.Initialize(
      id,
      data.structure,
      data.executer
    );
    if (cacheResult.success && result.success) {
      result.success = true;
      result.cache = cacheResult.data;
    }
    return result;
  }

  private GetAllData(
    isMemory: boolean,
    executer?: string,
    getOnlyExecuterJobs?: boolean,
    roomsToCheck?: string[],
    predicateMemory?: Predicate<StructureMemory>,
    predicateCache?: Predicate<StructureCache>,
    predicateCache2?: Predicate<StructureCache>
  ): StringMap<DoubleCRUDResult<StructureMemory, StructureCache>> {
    const result: StringMap<
      DoubleCRUDResult<StructureMemory, StructureCache>
    > = {};
    const ids = Object.keys(
      isMemory
        ? StructureMemoryData.GetAll(predicateMemory)
        : StructureCacheData.GetAll(
            executer,
            getOnlyExecuterJobs,
            roomsToCheck,
            predicateCache,
            predicateCache2
          )
    );
    forEach(ids, (id) => {
      const memoryResult = StructureMemoryData.Get(id);
      const cacheResult = StructureCacheData.Get(id);
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

  protected GetAllDataBasedOnMemory(
    predicate?: Predicate<StructureMemory>
  ): StringMap<DoubleCRUDResult<StructureMemory, StructureCache>> {
    return this.GetAllData(true, undefined, undefined, undefined, predicate);
  }

  protected GetAllDataBasedOnCache(
    executer = "",
    getOnlyExecuterJobs = false,
    roomsToCheck?: string[],
    predicate?: Predicate<StructureCache>,
    predicate2?: Predicate<StructureCache>
  ): StringMap<DoubleCRUDResult<StructureMemory, StructureCache>> {
    return this.GetAllData(
      false,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      undefined,
      predicate,
      predicate2
    );
  }
}
