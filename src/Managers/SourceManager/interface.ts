import { forEach } from "lodash";
import RoomHelper from "../BaseModels/Helper/Room/interface";
import JobData from "../BaseModels/Helper/Job/memory";
import RoomData from "../BaseModels/Helper/Room/memory";
import RoomPosition from "../BaseModels/Helper/Room/position";
import HandleSourceAndControllerStructure from "../Helper/handleSourceAndControllerStructure";

export default class RoomSourceManager {
  protected _executer: string;
  protected _roomInformation: RoomInformation;

  constructor(roomInformation: RoomInformation) {
    this._roomInformation = roomInformation;
    this._executer = RoomHelper.GetExecuter(roomInformation.room!.name, "Source");
  }

  private UpdateSources(): void {
    const managerMemory = this._roomInformation.memory!.sourceManager;
    const sourceIds = Object.keys(managerMemory.sources);
    const room = this._roomInformation.room!;
    forEach(sourceIds, (sourceId) => {
      const source = Game.getObjectById<Source>(sourceId);
      const sourceMemory = managerMemory.sources[sourceId];
      if (!sourceMemory.jobId) {
        const maxCreepsAround = RoomPosition.GetNonWallPositionsAround(
          sourceMemory.pos,
          room
        ).length;
        const jobResult = JobData.Initialize({
          executer: this._executer,
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
        }
      }

      if (source)
        HandleSourceAndControllerStructure(
          source,
          sourceMemory,
          "source",
          this._executer,
          room.controller
        );
    });
  }

  protected ExecuteRoomSourceManager(): void {
    this.UpdateSources();
  }
}
