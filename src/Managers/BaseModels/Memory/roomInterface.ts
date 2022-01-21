import { clone } from "lodash";
import BaseMemory from "./interface";
import IControllerManager from "../../ControllerManager/interface";
import IMineralManager from "../../MineralManager/interface";
import ISourceManager from "../../SourceManager/interface";
import ISpawnManager from "../../SpawnManager/interface";

interface IRoomMemory {
}

export default class extends BaseMemory implements IRoomMemory {
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
  static Generate(room:Room,remoteRooms: StringMap<RemoteRoom> = {}): RoomMemory {
    return {
      version: super.MinimumVersion(this.type),
      remoteRooms: remoteRooms,
      controllerManager: IControllerManager.SetupMemory(room),
      mineralManager: IMineralManager.SetupMemory(room),
      sourceManager: ISourceManager.SetupMemory(room),
      spawnManager: ISpawnManager.SetupMemory(room),
    };
  }

  static Get(id: string): CRUDResult<RoomMemory> {
    const data = clone(Memory.RoomsData.data[id]);
    return { success: !!data, data };
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

  static Delete(id: string): CRUDResult<RoomMemory> {
    delete Memory.RoomsData.data[id];
    return { success: true, data: undefined };
  }

  static GetAll(predicate?: Predicate<RoomMemory>): StringMap<RoomMemory> {
    let { data } = Memory.RoomsData;
    data = super.GetAllData(data, predicate);
    return data;
  }
  static Initialize(id:string,room:Room,remoteRooms?: StringMap<RemoteRoom>): CRUDResult<RoomMemory> {
    const data = this.Generate(room,remoteRooms);
    const result = this.Create(id, data);
    return { success: result.success, data:result.data };
  }
}
