import { forEach } from "lodash";
import IRoomPosition from "../BaseModels/Helper/Room/roomPosition";

interface ISpawnMemory {}

export default class implements ISpawnMemory {
    static SetupMemory(room: Room): SourceManager {
        const sources = room.find(FIND_SOURCES);
        const sourceManagerMemory: SourceManager = { sources: {} };
        forEach(sources, (source) => {
          sourceManagerMemory.sources[source.id] = {
            jobId: undefined,
            maxEnergy: source.energyCapacity,
            pos: IRoomPosition.FreezeRoomPosition(source.pos),
          };
        });
        return sourceManagerMemory;
      }
}