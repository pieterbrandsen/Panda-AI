import { clone } from "lodash";
import BaseMemory from "./interface";
import IRoomPosition from "../Helper/Room/roomPosition";

interface IStructureCache {}

export default class extends BaseMemory implements IStructureCache {
  private static type: CacheTypes = "Structure";

  static Validate(data: StringMap<StructureCache>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: StructureCache): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(structure: Structure, executer: string): StructureCache {
    return {
      type: structure.structureType,
      version: super.MinimumVersion(this.type),
      executer,
      pos: IRoomPosition.FreezeRoomPosition(structure.pos),
    };
  }

  static Get(id: string): CRUDResult<StructureCache> {
    const data = clone(Memory.StructuresData.cache[id]);
    if (data === undefined) return { success: false, data: undefined };
    return { success: this.ValidateSingle(data), data };
  }

  static Create(id: string, data: StructureCache): CRUDResult<StructureCache> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(id: string, data: StructureCache): CRUDResult<StructureCache> {
    Memory.StructuresData.cache[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<StructureCache> {
    delete Memory.StructuresData.cache[id];
    return { success: true, data: undefined };
  }

  static GetAll(
    executer: string,
    getOnlyExecuterJobs = true,
    roomsToCheck: string[] = [],
    predicate?: Predicate<StructureCache>,
    predicate2?: Predicate<StructureCache>
  ): StringMap<StructureCache> {
    let data = Memory.StructuresData.cache;
    data = super.GetAllData(
      data,
      this.type,
      executer,
      getOnlyExecuterJobs,
      roomsToCheck,
      predicate,
      predicate2
    );
    return data;
  }

  static Initialize(
    id: string,
    structure: Structure,
    executer: string
  ): CRUDResult<StructureCache> {
    const cache = this.Generate(structure, executer);
    const result = this.Create(id, cache);
    return { data: result.data, success: result.success };
  }
}
