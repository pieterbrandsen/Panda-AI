import { clone } from "lodash";
import BaseMemory from "./interface";

interface IRoomMemory {
  Validate(data: StringMap<RoomMemory>): ValidatedData;
  ValidateSingle(data: RoomMemory): boolean;
  Generate(): RoomMemory;
}

export default class extends BaseMemory implements IRoomMemory {
  private type: MemoryTypes = "Room";

  Validate(data: StringMap<RoomMemory>): ValidatedData {
    return super.Validate(data, this.type);
  }

  ValidateSingle(data: RoomMemory): boolean {
    return super.ValidateSingle(data, this.type);
  }

  /**
   * Create an new object of this type
   */
  Generate(remoteRooms?:StringMap<RemoteRoom>): RoomMemory {
    return {
      version: super.MinimumVersion(this.type),
      remoteRooms: remoteRooms ?? {},
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
    let data =Memory.RoomsData.data;
    data= super.GetAllData(data,predicate);
    return data;
  }
}
