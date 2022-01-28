import { clone } from "lodash";
import BaseMemory from "./interface";
import RoomPosition from "../Helper/Room/roomPosition";

interface IJobMemory {}

export default class extends BaseMemory implements IJobMemory {
  private static type: MemoryTypes = "Job";

  static Validate(data: StringMap<JobMemory>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: JobMemory): boolean {
    return super.ValidateSingle(data, this.type);
  }

  static Generate(
    targetId: string,
    pos: FreezedRoomPosition,
    objectType: JobObjectExecuter,
    amountToTransfer?: number,
    fromTargetId?: string,
    structureType?: StructureConstant,
    maxCreepsCount?: number
  ): JobMemory {
    return {
      lastAssigned: Game.time,
      targetId,
      pos,
      version: super.MinimumVersion(this.type),
      amountToTransfer,
      fromTargetId,
      structureType,
      objectType,
      maxCreepsCount,
    };
  }

  static Get(id: string): CRUDResult<JobMemory> {
    const data = clone(Memory.JobsData.data[id]);
    if (data === undefined) return { success: false, data: undefined };

    data.pos = RoomPosition.UnFreezeRoomPosition(data.pos);
    return { success: this.ValidateSingle(data), data };
  }

  static Create(id: string, data: JobMemory): CRUDResult<JobMemory> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(id: string, data: JobMemory): CRUDResult<JobMemory> {
    Memory.JobsData.data[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<JobMemory> {
    delete Memory.JobsData.data[id];
    return { success: true, data: undefined };
  }

  static GetAll(predicate?: Predicate<JobMemory>): StringMap<JobMemory> {
    let { data } = Memory.JobsData;
    data = super.GetAllData(data, this.type, predicate);
    return data;
  }

  static Initialize(
    id: string,
    targetId: string,
    pos: FreezedRoomPosition,
    objectType: JobObjectExecuter,
    amountToTransfer?: number,
    fromTargetId?: string,
    structureType?: StructureConstant,
    maxCreepsCount?: number
  ): CRUDResult<JobMemory> {
    const cache = this.Generate(
      targetId,
      pos,
      objectType,
      amountToTransfer,
      fromTargetId,
      structureType,
      maxCreepsCount
    );
    const result = this.Create(id, cache);
    return { data: result.data, success: result.success };
  }
}
