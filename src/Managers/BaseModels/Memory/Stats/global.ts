import { clone } from "lodash";
import BaseMemoryData from "../interface";

export default class GlobalStatsMemoryData extends BaseMemoryData {
  private static type: MemoryTypes = "Stats";

  static Validate(data: StringMap<StatsMemory>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: StatsMemory): boolean {
    return super.ValidateSingle(data, this.type);
  }

  static Generate(version?: number): StatsMemory {
    return {
      version: version ?? super.MinimumVersion(this.type),
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

  static Get(): CRUDResult<StatsMemory> {
    const data = clone(Memory.stats);
    if (data === undefined) return { success: false, data: undefined };

    return { success: this.ValidateSingle(data), data };
  }

  static Create(data: StatsMemory): CRUDResult<StatsMemory> {
    const dataAtId = this.Get();
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(data);
    return { success: result.success, data: clone(result.data) };
  }

  static Update(data: StatsMemory): CRUDResult<StatsMemory> {
    Memory.stats = data;
    return { success: true, data };
  }
}
