import { clone } from "lodash";
import BaseCacheData from "./interface";
import RoomPosition from "../Helper/Room/position";

export default class StructureCacheData extends BaseCacheData {
  protected _id:string;
  constructor(id:string) {
    const cacheType:CacheTypes = "Structure";
    super(cacheType);
    this._id = id;
  }
  protected ValidateCacheData(data: StringMap<StructureCache>): ValidatedData {
    return super.ValidateCacheData(data);
  }

  protected ValidateSingleCacheData(data: StructureCache): boolean {
    return super.ValidateSingleCacheData(data);
  }

  /**
   * Create an new object of this type
   */
  protected GenerateCacheData(structure: Structure, executer: string): StructureCache {
    return {
      type: structure.structureType,
      version: super.MinimumCacheVersion(),
      executer,
      pos: RoomPosition.FreezeRoomPosition(structure.pos),
    };
  }

  protected GetCacheData(): CRUDResult<StructureCache> {
    const data = clone(Memory.StructuresData.cache[this._id]);
    if (data === undefined) return { success: false, data: undefined };
    return { success: data !== undefined ? this.ValidateSingleCacheData(data) : false, data };
  }

  protected CreateCacheData(data: StructureCache): CRUDResult<StructureCache> {
    let getResult = this.GetCacheData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateCacheData(data);
    getResult = this.GetCacheData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  protected UpdateCacheData(data: StructureCache): CRUDResult<StructureCache> {
    Memory.StructuresData.cache[this._id] = data;
    return { success:  Memory.StructuresData.cache[this._id] !== undefined, data };
  }

  protected DeleteCacheData(): CRUDResult<StructureCache> {
    delete Memory.StructuresData.cache[this._id];
    return { success: Memory.StructuresData.cache[this._id] === undefined, data: undefined };
  }

  protected static GetAllCacheData(type:CacheTypes,
    executer = "",
    getOnlyExecuterJobs = true,
    roomsToCheck: string[] = [],
    predicate?: Predicate<StructureCache>,
    predicate2?: Predicate<StructureCache>
  ): StringMap<StructureCache> {
    let data = Memory.StructuresData.cache;
    data = super.GetAllCacheDataFilter(type,
      data,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      predicate,
      predicate2
    );
    return data;
  }

  protected InitializeCacheData(structure: Structure,
    executer: string
  ): CRUDResult<StructureCache> {
    const cache = this.GenerateCacheData(structure, executer);
    const createResult = this.CreateCacheData(cache);
    return { data: createResult.data, success: createResult.success };
  }
}
