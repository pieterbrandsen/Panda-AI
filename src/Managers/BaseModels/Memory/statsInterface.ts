import { clone, pickBy } from "lodash";
import BaseMemory from "./interface";
import RoomPosition from "../Helper/Room/roomPosition";

interface IStatsMemory {}

export default class extends BaseMemory implements IStatsMemory {
  private static type: MemoryTypes = "Stats";

  static Validate(data: StringMap<StatsMemory>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: StatsMemory): boolean {
    return super.ValidateSingle(data, this.type);
  }

  static Generate(
  ): StatsMemory {
    return {
      version: super.MinimumVersion(this.type),
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
