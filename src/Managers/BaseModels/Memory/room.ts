import { clone } from "lodash";
import BaseMemoryData from "./interface";
import ControllerManagerData from "../../ControllerManager/memory";
import MineralManagerData from "../../MineralManager/memory";
import SourceManagerData from "../../SourceManager/memory";
import SpawnManagerData from "../../SpawnManager/memory";
import DroppedResourceManagerData from "../../DroppedResourceManager/memory";
import RoomStatsMemoryData from "./Stats/room";

export default class RoomMemoryData extends BaseMemoryData {
  protected _id: string;
  constructor(id:string) {
    const memoryType: MemoryTypes = "Room";
    super(memoryType);
    this._id = id;
  }

  protected ValidateMemoryData(data: StringMap<RoomMemory>): ValidatedData {
    return super.ValidateMemoryData(data);
  }

  protected ValidateSingleMemoryData(data: RoomMemory): boolean {
    return super.ValidateSingleMemoryData(data);
  }

  /**
   * Create an new object of this type
   */
  protected GenerateMemoryData(room: Room, remoteRooms?: StringMap<RemoteRoom>): RoomMemory {
    return {
      version: super.MinimumMemoryVersion(),
      remoteRooms,
      controllerManager: ControllerManagerData.SetupMemory(room),
      mineralManager: MineralManagerData.SetupMemory(room),
      sourceManager: SourceManagerData.SetupMemory(room),
      spawnManager: SpawnManagerData.SetupMemory(),
      droppedResourceManager: DroppedResourceManagerData.SetupMemory(),
    };
  }

  protected GetMemoryData(): CRUDResult<RoomMemory> {
    const data = clone(Memory.RoomsData.data[this._id]);
    return { success: data !== undefined ? this.ValidateSingleMemoryData(data) : false, data };
  }

  protected CreateMemoryData(data: RoomMemory): CRUDResult<RoomMemory> {
    let getResult = this.GetMemoryData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateMemoryData(data);
    getResult = this.GetMemoryData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  protected UpdateMemoryData(data: RoomMemory): CRUDResult<RoomMemory> {
    Memory.RoomsData.data[this._id] = data;
    return { success: Memory.RoomsData.data[this._id] !== undefined, data };
  }

  protected UpdateSourceMemoryData(
    sourceId: string,
    data: SourceMemory
  ): CRUDResult<SourceMemory> {
    Memory.RoomsData.data[this._id].sourceManager.sources[sourceId] = data;
    return { success: Memory.RoomsData.data[this._id].sourceManager.sources[sourceId] !== undefined, data };
  }

  protected UpdateControllerMemoryData(
    data: ControllerMemory
  ): CRUDResult<ControllerMemory> {
    Memory.RoomsData.data[this._id].controllerManager.controller = data;
    return { success: Memory.RoomsData.data[this._id].controllerManager.controller !== undefined, data };
  }

  protected DeleteMemoryData(): CRUDResult<RoomMemory> {
    delete Memory.RoomsData.data[this._id];

    const result = new RoomStatsMemoryData(this._id).DeleteMemoryData().success;
    return { success: result, data: undefined };
  }

  protected static GetAllMemoryData(type:MemoryTypes,predicate?: Predicate<RoomMemory>): StringMap<RoomMemory> {
    let { data } = Memory.RoomsData;
    data = super.GetAllMemoryDataFilter(type,data, predicate);
    return data;
  }

  protected InitializeMemoryData(
    room: Room,
    remoteRooms?: StringMap<RemoteRoom>
  ): CRUDResult<RoomMemory> {
    const data = this.GenerateMemoryData(room, remoteRooms);
    const result = this.CreateMemoryData(data);
    if (result.success) {
      result.success = new RoomStatsMemoryData(this._id).DeleteMemoryData().success;
    }

    return { success: result.success, data: result.data };
  }
}
