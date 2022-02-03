import { forEach } from "lodash";
import IRoomMemory from "../BaseModels/Memory/roomInterface";
import IRoomHelper from "../BaseModels/Helper/Room/roomInterface";
import IJobData from "../BaseModels/Helper/Job/jobMemory";
import IRoomPosition from "../BaseModels/Helper/Room/roomPosition";

interface ISourceManager {}

export default class implements ISourceManager {
  updatedMemory = false;

  executer: string;

  room: Room;

  memory: RoomMemory;

  managerMemory: SourceManager;

  cache: RoomCache;

  constructor(roomName: string, roomMemory: RoomMemory, roomCache: RoomCache) {
    this.room = Game.rooms[roomName];
    this.memory = roomMemory;
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
        const maxCreepsAround = IRoomPosition.GetNonWallPositionsAround(
          sourceMemory.pos,
          this.room
        );
        const jobResult = IJobData.Initialize({
          executer: this.executer,
          pos: sourceMemory.pos,
          targetId: sourceId,
          type: "HarvestSource",
          objectType: "Creep",
          maxCreepsCount: maxCreepsAround,
        });

        if (!jobResult.success || !jobResult.cache || !jobResult.memory) return;
        const jobId = IJobData.GetJobId(
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
