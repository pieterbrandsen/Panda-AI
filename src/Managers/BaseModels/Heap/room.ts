import { clone } from "lodash";
import BaseHeapData from "./interface";

export default class RoomHeapData extends BaseHeapData {
  protected _id: string;

  constructor(id: string) {
    const heapType: HeapTypes = "Room";
    super(heapType);
    this._id = id;
  }

  protected ValidateSingleHeapData(): boolean {
    return super.ValidateSingleHeapData(this._id);
  }

  /**
   * Create an new object of this type
   */
  protected GenerateHeapData(): RoomHeap {
    return {
      stats: {
        energyIncoming: {
          HarvestMineral: 0,
          HarvestSource: 0,
          WithdrawResource: 0,
          PickupResource: 0,
        },
        energyOutgoing: {
          Build: 0,
          Repair: 0,
          TransferSpawn: 0,
          TransferStructure: 0,
          UpgradeController: 0,
          DroppedEnergyDecay: 0,
          SpawnCreeps: 0,
        },
        spawnEnergyOutgoing: {
          claimer: 0,
          miner: 0,
          transferer: 0,
          worker: 0,
          extractor: 0,
        },
        controller: {
          level: 0,
          progress: 0,
          progressTotal: 0,
          ticksToDowngrade: 0,
        },
        creepsCount: 0,
        structuresCount: 0,
        isSpawning: {},
        spawnEnergy: {
          energy: 0,
          capacity: 0,
        },
      },
    };
  }

  protected GetHeapData(): CRUDResult<RoomHeap> {
    const data = clone(global.RoomsData[this._id]);
    return { success: this.ValidateSingleHeapData(), data };
  }

  protected CreateHeapData(data: RoomHeap): CRUDResult<RoomHeap> {
    let getResult = this.GetHeapData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateHeapData(data);
    getResult = this.GetHeapData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  protected UpdateHeapData(data: RoomHeap): CRUDResult<RoomHeap> {
    global.RoomsData[this._id] = data;
    return { success: this.ValidateSingleHeapData(), data };
  }

  protected DeleteHeapData(): CRUDResult<RoomHeap> {
    delete global.RoomsData[this._id];
    return { success: !this.ValidateSingleHeapData(), data: undefined };
  }

  protected InitializeHeapData(): CRUDResult<RoomHeap> {
    const data = this.GenerateHeapData();
    const createResult = this.CreateHeapData(data);
    return { success: createResult.success, data: createResult.data };
  }
}
