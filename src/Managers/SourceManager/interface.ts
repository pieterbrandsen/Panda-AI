import { forEach } from "lodash";
import RoomHelper from "../BaseModels/Helper/Room/interface";
import JobData from "../BaseModels/Helper/Job/memory";
import RoomData from "../BaseModels/Helper/Room/memory";
import RoomPosition from "../BaseModels/Helper/Room/position";
import HandleSourceAndControllerStructure from "../Helper/handleSourceAndControllerStructure";

export default class SourceManager {
  private updatedMemory = false;

  private executer: string;

  private room: Room;

  private memory: RoomMemory;

  private managerMemory: SourceManagerMemory;

  private cache: RoomCache;

  constructor(roomName: string, roomMemory: RoomMemory, roomCache: RoomCache) {
    this.room = Game.rooms[roomName];
    this.memory = roomMemory;
    this.cache = roomCache;
    this.managerMemory = this.memory.sourceManager;

    this.executer = RoomHelper.GetExecuter(this.room.name, "Source");
  }

  private UpdateSources(): void {
    const { managerMemory } = this;
    const sourceIds = Object.keys(managerMemory.sources);
    forEach(sourceIds, (sourceId) => {
      const source = Game.getObjectById<Source>(sourceId);
      const sourceMemory = managerMemory.sources[sourceId];
      if (!sourceMemory.jobId) {
        const maxCreepsAround = RoomPosition.GetNonWallPositionsAround(
          sourceMemory.pos,
          this.room
        ).length;
        const jobResult = JobData.Initialize({
          executer: this.executer,
          pos: sourceMemory.pos,
          targetId: sourceId,
          type: "HarvestSource",
          objectType: "Creep",
          maxCreepsCount: maxCreepsAround,
        });

        if (!jobResult.success || !jobResult.cache || !jobResult.memory) return;
        const jobId = JobData.GetJobId(
          jobResult.cache.type,
          jobResult.memory.pos
        );
        if (jobId) {
          sourceMemory.jobId = jobId;
          this.updatedMemory = true;
        }
      }

      if (source)
        HandleSourceAndControllerStructure(
          source,
          sourceMemory,
          "source",
          this.executer,
          this.room.controller
        );
    });
  }

  Run(): void {
    this.UpdateSources();
    if (this.updatedMemory) {
      RoomData.UpdateMemory(this.room.name, this.memory);
    }
  }
}
