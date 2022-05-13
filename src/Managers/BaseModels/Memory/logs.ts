import { clone } from "lodash";
import BaseMemoryData from "./interface";

export default class LogsMemoryData extends BaseMemoryData {
  constructor() {
    const memoryType: MemoryTypes = "Structure";
    super(memoryType);
  }

  protected ValidateMemoryData(data: StringMap<LogsMemory>): ValidatedData {
    return super.ValidateMemoryData(data);
  }

  protected ValidateSingleMemoryData(data: LogsMemory): boolean {
    return super.ValidateSingleMemoryData(data);
  }

  public GenerateMemoryData(version?: number): LogsMemory {
    return {
      version: version ?? super.MinimumMemoryVersion(),
    };
  }

  protected GetMemoryData(): CRUDResult<LogsMemory> {
    const data = clone(Memory.logs);
    return {
      success: data !== undefined ? this.ValidateSingleMemoryData(data) : false,
      data,
    };
  }

  protected UpdateMemoryData(data: LogsMemory): CRUDResult<LogsMemory> {
    Memory.logs = data;
    return { success: Memory.logs !== undefined, data };
  }

  protected Create(data: LogsMemory): CRUDResult<LogsMemory> {
    let getResult = this.GetMemoryData();
    if (getResult.success) {
      return { success: false, data: getResult.data };
    }
    this.UpdateMemoryData(data);
    getResult = this.GetMemoryData();
    return { success: getResult.success, data: clone(getResult.data) };
  }
}
