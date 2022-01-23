import { forEach } from "lodash";
import IRoomMemory from "../BaseModels/Memory/roomInterface";
import IRoomHelper from "../BaseModels/Helper/Room/roomInterface";
import IJobMemory from "../BaseModels/Helper/Job/jobMemory";

interface ISourceManager {}

export default class implements ISourceManager {
  updatedMemory = false;

  executer: string;

  room: Room;

  memory: RoomMemory;

  managerMemory: SourceManager;

  cache: RoomCache;

  constructor(roomName: string,roomMemory:RoomMemory,roomCache:RoomCache) {
    this.room = Game.rooms[roomName];
    this.memory = roomMemory
    this.cache = roomCache;
    this.managerMemory = this.memory.sourceManager;

    this.executer = IRoomHelper.GetExecuter(this.room.name, "Source");
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
        const jobId = IJobMemory.GetJobId(
          jobResult.cache.type,
          jobResult.memory.pos
        );
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
