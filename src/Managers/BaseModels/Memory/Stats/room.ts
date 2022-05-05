import { clone, pickBy } from "lodash";
import BaseStatsMemoryData from "./interface";

export default class RoomStatsMemoryData extends BaseStatsMemoryData {
  static Get(id: string): CRUDResult<RoomStatsMemory> {
    const data = clone(Memory.stats.rooms[id]);
    if (data === undefined) return { success: false, data: undefined };

    return { success: !!data, data };
  }

  static Create(
    id: string,
    data: RoomStatsMemory
  ): CRUDResult<RoomStatsMemory> {
    const dataAtId = this.Get(id);
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(id, data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(
    id: string,
    data: RoomStatsMemory
  ): CRUDResult<RoomStatsMemory> {
    Memory.stats.rooms[id] = data;
    return { success: true, data };
  }

  static Delete(id: string): CRUDResult<RoomStatsMemory> {
    delete Memory.stats.rooms[id];
    return { success: true, data: undefined };
  }

  static GetAll(
    getOnlyFreeJobs = false,
    predicate?: Predicate<RoomStatsMemory>
  ): StringMap<RoomStatsMemory> {
    let data = Memory.stats.rooms;
    if (getOnlyFreeJobs) data = pickBy(data);
    data = super.GetAllData(data, predicate);
    return data;
  }

  static Generate(): RoomStatsMemory {
    return {
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
    };
  }

  static Initialize(id: string): CRUDResult<RoomStatsMemory> {
    const memory = this.Generate();
    const result = this.Create(id, memory);
    return { data: result.data, success: result.success };
  }
}
