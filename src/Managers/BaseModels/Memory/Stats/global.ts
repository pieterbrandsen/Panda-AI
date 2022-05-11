import { clone } from "lodash";
import BaseMemoryData from "../interface";

export default class GlobalStatsMemoryData extends BaseMemoryData {
  constructor() {
    const memoryType: MemoryTypes = "Stats";
    super(memoryType);
  }

  public ValidateMemoryData(data: StringMap<StatsMemory>): ValidatedData {
    return super.ValidateMemoryData(data);
  }

  public ValidateSingleMemoryData(data: StatsMemory): boolean {
    return super.ValidateSingleMemoryData(data);
  }

  public GenerateMemoryData(version?: number): StatsMemory {
    return {
      version: version ?? super.MinimumMemoryVersion(),
      rooms: {},
      resources: {
        ACCESS_KEY: 0,
        CPU_UNLOCK: 0,
        PIXEL: 0,
      },
      gcl: {
        level: 0,
        progress: 0,
        progressTotal: 0,
      },
    };
  }

  public GetMemoryData(): CRUDResult<StatsMemory> {
    const data = clone(Memory.stats);
    return { success: data !== undefined ? this.ValidateSingleMemoryData(data) : false, data };
  }

  public CreateMemoryData(data: StatsMemory): CRUDResult<StatsMemory> {
    let getResult = this.GetMemoryData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateMemoryData(data);
    getResult = this.GetMemoryData();
    return { success: getResult.success, data: clone(getResult.data) };
  }

  public UpdateMemoryData(data: StatsMemory): CRUDResult<StatsMemory> {
    Memory.stats = data;
    return { success: Memory.stats !== undefined, data };
  }
}
