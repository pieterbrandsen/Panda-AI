/* eslint-disable class-methods-use-this */

import { pickBy } from "lodash";

export default abstract class StatsMemoryData {
  public GetAllData<T extends MemoryStatsObjects>(
    data: StringMap<T>,
    predicate?: Predicate<T>
  ): StringMap<T> {
    if (!predicate) {
      return data;
    }

    return pickBy(data, predicate);
  }
}
