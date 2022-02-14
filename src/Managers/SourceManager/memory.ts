import { forEach } from "lodash";
import RoomPosition from "../BaseModels/Helper/Room/position";

export default class SourceManagerMemoryData {
  static SetupMemory(room: Room): SourceManagerMemory {
    const sources = room.find(FIND_SOURCES);
    const sourceManagerMemory: SourceManagerMemory = { sources: {} };
    forEach(sources, (source) => {
      sourceManagerMemory.sources[source.id] = {
        jobId: undefined,
        maxEnergy: source.energyCapacity,
        pos: RoomPosition.FreezeRoomPosition(source.pos),
      };
    });
    return sourceManagerMemory;
  }
}
