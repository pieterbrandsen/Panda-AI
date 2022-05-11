import { clone, pickBy } from "lodash";
import BaseStatsMemoryData from "./interface";

export default class RoomStatsMemoryData extends BaseStatsMemoryData {
  private _id: string;
  constructor(id:string) {
    super();
    this._id = id;
  }
  public GetMemoryData(): CRUDResult<RoomStatsMemory> {
    const data = clone(Memory.stats.rooms[this._id]);
    if (data === undefined) return { success: false, data: undefined };

    return { success: !!data, data };
  }

  public CreateMemoryData(
    data: RoomStatsMemory
  ): CRUDResult<RoomStatsMemory> {
    let getResult = this.GetMemoryData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateMemoryData(data);
    getResult = this.GetMemoryData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  public UpdateMemoryData(
    data: RoomStatsMemory
  ): CRUDResult<RoomStatsMemory> {
    Memory.stats.rooms[this._id] = data;
    return { success: Memory.stats.rooms[this._id] !== undefined, data };
  }

  public DeleteMemoryData(): CRUDResult<RoomStatsMemory> {
    delete Memory.stats.rooms[this._id];
    return { success: Memory.stats.rooms[this._id] === undefined, data: undefined };
  }

  public GetAllMemoryData(
    getOnlyFreeJobs = false,
    predicate?: Predicate<RoomStatsMemory>
  ): StringMap<RoomStatsMemory> {
    let data = Memory.stats.rooms;
    if (getOnlyFreeJobs) data = pickBy(data);
    data = super.GetAllData(data, predicate);
    return data;
  }

  public GenerateMemoryData(): RoomStatsMemory {
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

  public InitializeMemoryData(): CRUDResult<RoomStatsMemory> {
    const data = this.GenerateMemoryData();
    const createResult = this.CreateMemoryData(data);
    return { data: createResult.data, success: createResult.success };
  }
}
