import { forEach } from "lodash";
import IRoomCache from "../BaseModels/Cache/roomInterface";
import IRoomMemory from "../BaseModels/Memory/roomInterface";
import IRoomHelper from "../BaseModels/Helper/roomInterface";
import IJobMemory from "../BaseModels/Helper/jobMemory";

interface ISourceManager {}

export default class implements ISourceManager {
  updatedMemory = false;

  executer: string;

  room: Room;

  memory: RoomMemory;

  managerMemory: SourceManager;

  cache: RoomCache;

  constructor(roomName: string) {
    this.room = Game.rooms[roomName];
    this.memory = IRoomMemory.Get(roomName).data as RoomMemory;
    this.cache = IRoomCache.Get(roomName).data as RoomCache;
    this.managerMemory = this.memory.sourceManager;

    this.executer = IRoomHelper.GetExecuter(this.room.name, "Source");
  }

  static SetupMemory(room: Room): SourceManager {
      const sources = room.find(FIND_SOURCES);
      const sourceManagerMemory:SourceManager = {sources:{}}; 
    forEach(sources, (source) => {
      sourceManagerMemory.sources[source.id] = {
        jobId: undefined,
        maxEnergy: source.energyCapacity,
        pos: IRoomHelper.FreezeRoomPosition(source.pos),
      };
    });
    return sourceManagerMemory;
  }

  UpdateSources(): void {
    const { managerMemory } = this;
    const sourceIds = Object.keys(managerMemory.sources);
      forEach(sourceIds, (sourceId) => {
        const sourceMemory = managerMemory.sources[sourceId];
        if (!sourceMemory.jobId) {
          const jobResult = IJobMemory.Initialize({
            executer: this.executer,
            pos: sourceMemory.pos,
            targetId: sourceId,
            type: "HarvestSource",
          });
          if (!jobResult.success || !jobResult.cache || !jobResult.memory) return;
          const jobId = IJobMemory.GetJobId(jobResult.cache.type, jobResult.memory.pos);
          if (jobId) {
            sourceMemory.jobId = jobId;
            this.updatedMemory = true;
          }
        }
      });
  }

  Run(): void {
    this.UpdateSources();
    if (this.updatedMemory) {
      IRoomMemory.Update(this.room.name, this.memory);
    }
  }
}
