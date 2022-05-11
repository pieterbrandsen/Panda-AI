import { clone, pickBy } from "lodash";
import BaseMemoryData from "./interface";
import RoomPosition from "../Helper/Room/position";

export default class JobMemoryData extends BaseMemoryData {
  protected _id: string;
  constructor(id:string) {
    const memoryType: MemoryTypes = "Job";
    super(memoryType);
    this._id = id;
  }

  protected ValidateMemoryData(data: StringMap<JobMemory>): ValidatedData {
    return super.ValidateMemoryData(data);
  }

  protected ValidateSingleMemoryData(data: JobMemory): boolean {
    return super.ValidateSingleMemoryData(data);
  }

  protected GenerateMemoryData(
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
      version: super.MinimumMemoryVersion(),
      amountToTransfer,
      fromTargetId,
      structureType,
      objectType,
      maxCreepsCount,
      assignedCreeps: [],
    };
  }

  protected GetMemoryData(): CRUDResult<JobMemory> {
    const data = clone(Memory.JobsData.data[this._id]);
    data.pos = RoomPosition.UnFreezeRoomPosition(data.pos);
    return { success: data !== undefined ? this.ValidateSingleMemoryData(data) : false, data };
  }

  protected CreateMemoryData(data: JobMemory): CRUDResult<JobMemory> {
    let getResult = this.GetMemoryData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateMemoryData(data);
    getResult = this.GetMemoryData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  protected UpdateMemoryData(data: JobMemory): CRUDResult<JobMemory> {
    Memory.JobsData.data[this._id] = data;
    return { success: Memory.JobsData.data[this._id] !== undefined, data };
  }

  protected DeleteMemoryData(): CRUDResult<JobMemory> {
    delete Memory.JobsData.data[this._id];
    return { success: Memory.JobsData.data[this._id] === undefined, data: undefined };
  }

  protected static GetAllMemoryData(
    type:MemoryTypes,
    getOnlyFreeJobs = false,
    predicate?: Predicate<JobMemory>
  ): StringMap<JobMemory> {
    let { data } = Memory.JobsData;
    if (getOnlyFreeJobs) data = pickBy(data);
    data = super.GetAllMemoryDataFilter(type, data, predicate);
    return data;
  }

  protected InitializeMemoryData(
    targetId: string,
    pos: FreezedRoomPosition,
    objectType: JobObjectExecuter,
    amountToTransfer?: number,
    fromTargetId?: string,
    structureType?: StructureConstant,
    maxCreepsCount?: number
  ): CRUDResult<JobMemory> {
    const memory = this.GenerateMemoryData(
      targetId,
      pos,
      objectType,
      amountToTransfer,
      fromTargetId,
      structureType,
      maxCreepsCount
    );
    const result = this.CreateMemoryData(memory);
    return { data: result.data, success: result.success };
  }
}
