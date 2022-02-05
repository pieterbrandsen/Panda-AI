/* eslint-disable class-methods-use-this */

import { pickBy } from "lodash";

export interface IStatsMemory {}

export default abstract class implements IStatsMemory {
  protected static GetAllData<T extends MemoryStatsObjects>(
    data: StringMap<T>,
    predicate?: Predicate<T>
  ): StringMap<T> {
    if (!predicate) {
      return data;
    }

    return pickBy(data, predicate);
  }
}
