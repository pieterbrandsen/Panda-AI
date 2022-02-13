import { clone } from "lodash";
import BaseHeap from "./interface";

interface IBaseHeap {}

export default class extends BaseHeap implements IBaseHeap {
  private static type: HeapTypes = "Room";

  static ValidateSingle(id: string): boolean {
    return super.ValidateSingle(id, this.type);
  }

  /**
   * Create an new object of this type
   */
  static Generate(): RoomHeap {
    return {
      stats: {
        energyIncoming: {
          HarvestMineral: 0,
          HarvestSource: 0,
          WithdrawResource: 0,
          WithdrawStructure: 0,
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

  static Get(id: string): CRUDResult<RoomHeap> {
    const data = clone(global.RoomsData[id]);
    return { success: !!data, data };
  }

  static Create(id: string, data: RoomHeap): CRUDResult<RoomHeap> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(id: string, data: RoomHeap): CRUDResult<RoomHeap> {
    global.RoomsData[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<RoomHeap> {
    delete global.RoomsData[id];
    return { success: true, data: undefined };
  }

  static Initialize(id: string): CRUDResult<RoomHeap> {
    const data = this.Generate();
    const result = this.Create(id, data);
    return { success: result.success, data: result.data };
  }
}
