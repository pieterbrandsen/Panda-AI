import { clone } from "lodash";
import BaseMemoryData from "./interface";

export default class LogsMemoryData extends BaseMemoryData {
  private static type: MemoryTypes = "Log";

  static Validate(data: StringMap<LogsMemory>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: LogsMemory): boolean {
    return super.ValidateSingle(data, this.type);
  }

  static Generate(version?: number): LogsMemory {
    return {
      version: version ?? super.MinimumVersion(this.type),
    };
  }

  static Get(): CRUDResult<LogsMemory> {
    const data = clone(Memory.logs);
    if (data === undefined) return { success: false, data: undefined };

    return { success: this.ValidateSingle(data), data };
  }

  static Update(data: LogsMemory): CRUDResult<LogsMemory> {
    Memory.logs = data;
    return { success: true, data };
  }

  static Create(data: LogsMemory): CRUDResult<LogsMemory> {
    const dataAtId = this.Get();
    if (dataAtId.success) {
      return { success: false, data: dataAtId.data };
    }
    const result = this.Update(data);
    return { success: result.success, data: clone(result.data) };
  }
}
