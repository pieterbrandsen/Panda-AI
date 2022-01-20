import { clone } from "lodash";
import BaseMemory from "./interface";
import RoomHelper from "../Helper/roomInterface";

interface IJobMemory {
  Validate(data: StringMap<JobMemory>): ValidatedData;
  ValidateSingle(data: JobMemory): boolean;
  // Generate(data:JobInitializationData): JobMemory;
}

export default class extends BaseMemory implements IJobMemory {
  private type: MemoryTypes = "Job";

  Validate(data: StringMap<JobMemory>): ValidatedData {
    return super.Validate(data, this.type);
  }

  ValidateSingle(data: JobMemory): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  GenerateObject(data: JobInitializationData): JobMemory {
    return {
      pos: data.pos,
      lastAssigned: Game.time,
      targetId: data.targetId,
      amountToTransfer: data.amountToTransfer,
      fromTargetId: data.fromTargetId,
      version: super.MinimumVersion(this.type),
    };
  }

  Generate(type: JobTypes, pos: FreezedRoomPosition): JobMemory {
    return this.GenerateObject({
      type,
      pos,
      executer: "",
      targetId: "",
      amountToTransfer: 0,
      fromTargetId: "",
    });
  }

  static Get(id: string): CRUDResult<JobMemory> {
    const data = clone(Memory.JobsData.data[id]);
    data.pos = RoomHelper.UnfreezeRoomPosition(data.pos);
    return { success: !!data, data };
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
    data = super.GetAllData(data, predicate);
    return data;
  }
}
