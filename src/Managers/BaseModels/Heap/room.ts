import { clone } from "lodash";
import BaseHeapData from "./interface";

export default class RoomHeapData extends BaseHeapData {
  private type: HeapTypes = "Room";

  private _id: string;

  constructor(id: string) {
    super();
    this._id = id;
  }

  protected ValidateSingleHeap(): boolean {
    return super.ValidateSingleHeap(this._id, this.type);
  }

  /**
   * Create an new object of this type
   */
  protected GenerateHeap(): RoomHeap {
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

  protected GetHeap(): CRUDResult<RoomHeap> {
    const data = clone(global.RoomsData[this._id]);
    return { success: !!data, data };
  }

  protected CreateHeap(data: RoomHeap): CRUDResult<RoomHeap> {
    const dataAtId = this.GetHeap();
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.UpdateHeap(data);
    return { success: result.success, data: clone(result.data) };
  }

  protected UpdateHeap(data: RoomHeap): CRUDResult<RoomHeap> {
    global.RoomsData[this._id] = data;
    return { success: true, data };
  }

  protected DeleteHeap(): CRUDResult<RoomHeap> {
    delete global.RoomsData[this._id];
    return { success: true, data: undefined };
  }

  protected InitializeHeap(): CRUDResult<RoomHeap> {
    const data = this.GenerateHeap();
    const result = this.CreateHeap(data);
    return { success: result.success, data: result.data };
  }
}
