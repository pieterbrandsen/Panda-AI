import { forEach, union } from "lodash";
import { Mixin } from "ts-mixer";
import RoomData from "../../Managers/BaseModels/Helper/Room/memory";
import CreepData from "../../Managers/BaseModels/Helper/Creep/memory";
import StructureData from "../../Managers/BaseModels/Helper/Structure/memory";
import ControllerManager from "../../Managers/ControllerManager/interface";
import MineralManager from "../../Managers/MineralManager/interface";
import SourceManager from "../../Managers/SourceManager/interface";
import DroppedResourceManager from "../../Managers/DroppedResourceManager/interface";
import SpawnManager from "../../Managers/SpawnManager/interface";
import CreepExecuter from "../Creep/interface";
import StructureExecuter from "../Structure/interface";
import Jobs from "../../Managers/BaseModels/Jobs/interface";
import JobData from "../../Managers/BaseModels/Helper/Job/memory";
import SetupRoom from "../../Managers/BaseModels/Helper/Room/setup";
import RoomHeap from "../../Managers/BaseModels/Heap/room";
import UpdateRoomStats from "../../Managers/BaseModels/Helper/Stats/updateRoom";
import RoomSourceManager from "../../Managers/SourceManager/interface";
import RoomDroppedResourceManager from "../../Managers/DroppedResourceManager/interface";
import RoomControllerManager from "../../Managers/ControllerManager/interface";
import RoomSpawnManager from "../../Managers/SpawnManager/interface";
import RoomMineralManager from "../../Managers/MineralManager/interface";

export default class RoomHandler extends Mixin(RoomData,RoomSourceManager,RoomDroppedResourceManager,RoomControllerManager,RoomMineralManager,RoomSpawnManager) {
  public _roomInformation: RoomInformation;

  private _roomStructures: StringMap<
    DoubleCRUDResult<StructureMemory, StructureCache>
  >;

  private _roomCreeps: StringMap<DoubleCRUDResult<CreepMemory, CreepCache>>;

  public IsRoomSetup(): boolean {
    if (
      this._roomInformation.room &&
      this._roomInformation.cache &&
      this._roomInformation.memory
    )
      return true;
    return false;
  }

  constructor(roomName: string, hasVision: boolean) {
    const roomInformation: RoomInformation = {
      name: roomName,
      room: Game.rooms[roomName],
    };
    super(roomInformation);
    this._roomStructures = StructureData.GetAllDataBasedOnCache("", false, [
      roomName,
    ]);
    this._roomCreeps = CreepData.GetAllDataBasedOnCache("", false, [roomName]);
    if (!hasVision) {
      this._roomInformation = roomInformation;
      JobData.DeleteAllData(roomName);
      this.DeleteData(true, true);
      return;
    }

    const roomData = this.GetData();
    if (!roomData.success) {
      this._roomInformation = roomInformation;
      return;
    }
    roomInformation.memory = roomData.memory;
    roomInformation.cache = roomData.cache;

    const roomHeapData = this.GetHeap();
    if (!roomHeapData.success) {
      this.InitializeHeap();
    }

    this._roomInformation = roomInformation;
  }

  public Execute(): void {
    if (!this.IsRoomSetup()) return;
    const room = this._roomInformation.room!;
    const roomMemory = this._roomInformation.memory!;
    const roomCache = this._roomInformation.cache!;

    new StructureExecuter().ExecuteAllStructures(
      Object.keys(this._roomStructures) as Id<Structure<StructureConstant>>[]
    );
    new CreepExecuter().ExecuteAllCreeps(
      Object.keys(this._roomCreeps) as Id<Creep>[]
    );

    UpdateRoomStats(room);
    Jobs.UpdateAllData(room);

    const { controller } = room;
    this.ExecuteRoomSourceManager();
    this.ExecuteRoomDroppedResourceManager();

    if (controller) {
      this.ExecuteRoomControllerManager();
      if (controller.my) {
        this.ExecuteRoomMineralManager();
        this.ExecuteRoomSpawnManager();
      }
    }

    this.UpdateData(roomMemory, roomCache);
  }
}
