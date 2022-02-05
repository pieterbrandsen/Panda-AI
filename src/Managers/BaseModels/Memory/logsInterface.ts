import { clone, pickBy } from "lodash";
import BaseMemory from "./interface";
import RoomPosition from "../Helper/Room/roomPosition";

interface ILogsMemory {}

export default class extends BaseMemory implements ILogsMemory {
  private static type: MemoryTypes = "Log";

  static Validate(data: StringMap<LogsMemory>): ValidatedData {
    return super.Validate(data, this.type);
  }

  static ValidateSingle(data: LogsMemory): boolean {
    return super.ValidateSingle(data, this.type);
  }

  static Generate(
  ): LogsMemory {
    return {
        version: super.MinimumVersion(this.type),
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
