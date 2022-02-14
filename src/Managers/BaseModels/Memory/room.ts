import { clone } from "lodash";
import BaseMemoryData from "./interface";
import ControllerManagerData from "../../ControllerManager/memory";
import MineralManagerData from "../../MineralManager/memory";
import SourceManagerData from "../../SourceManager/memory";
import SpawnManagerData from "../../SpawnManager/memory";
import DroppedResourceManagerData from "../../DroppedResourceManager/memory";
import RoomStatsMemoryData from "./Stats/room";

export default class RoomMemoryData extends BaseMemoryData {
  private static type: MemoryTypes = "Room";

  static Validate(data: StringMap<RoomMemory>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: RoomMemory): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(room: Room, remoteRooms?: StringMap<RemoteRoom>): RoomMemory {
    return {
      version: super.MinimumVersion(this.type),
      remoteRooms,
      controllerManager: ControllerManagerData.SetupMemory(room),
      mineralManager: MineralManagerData.SetupMemory(room),
      sourceManager: SourceManagerData.SetupMemory(room),
      spawnManager: SpawnManagerData.SetupMemory(),
      droppedResourceManager: DroppedResourceManagerData.SetupMemory(),
    };
  }

  static Get(id: string): CRUDResult<RoomMemory> {
    const data = clone(Memory.RoomsData.data[id]);
    if (data === undefined) return { success: false, data: undefined };
    return { success: this.ValidateSingle(data), data };
  }

  static Create(id: string, data: RoomMemory): CRUDResult<RoomMemory> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(id: string, data: RoomMemory): CRUDResult<RoomMemory> {
    Memory.RoomsData.data[id] = data;
    return { success: true, data };
  }

  static UpdateSourceMemory(
    roomId: string,
    sourceId: string,
    data: SourceMemory
  ): CRUDResult<SourceMemory> {
    Memory.RoomsData.data[roomId].sourceManager.sources[sourceId] = data;
    return { success: true, data };
  }

  static UpdateControllerMemory(
    roomId: string,
    data: ControllerMemory
  ): CRUDResult<ControllerMemory> {
    Memory.RoomsData.data[roomId].controllerManager.controller = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<RoomMemory> {
    delete Memory.RoomsData.data[id];

    const result = RoomStatsMemoryData.Delete(id).success;
    return { success: result, data: undefined };
  }

  static GetAll(predicate?: Predicate<RoomMemory>): StringMap<RoomMemory> {
    let { data } = Memory.RoomsData;
    data = super.GetAllData(data, this.type, predicate);
    return data;
  }

  static Initialize(
    id: string,
    room: Room,
    remoteRooms?: StringMap<RemoteRoom>
  ): CRUDResult<RoomMemory> {
    const data = this.Generate(room, remoteRooms);
    const result = this.Create(id, data);
    if (result.success) {
      result.success = RoomStatsMemoryData.Initialize(id).success;
    }

    return { success: result.success, data: result.data };
  }
}
