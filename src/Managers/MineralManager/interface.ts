import RoomHelper from "../BaseModels/Helper/Room/interface";
import JobData from "../BaseModels/Helper/Job/memory";
import RoomConstruction from "../BaseModels/Helper/Room/construction";
import RoomPositionHelper from "../BaseModels/Helper/Room/position";

export default class RoomMineralManager {
  protected _roomInformation: RoomInformation;

  protected _executer: string;

  constructor(roomInformation: RoomInformation) {
    this._roomInformation = roomInformation;
    this._executer = RoomHelper.GetExecuter(
      roomInformation.room!.name,
      "Mineral"
    );
  }

  private UpdateMineral(): void {
    const managerMemory = this._roomInformation.memory!.mineralManager;
    const room = this._roomInformation.room!;

    const mineralMemory = managerMemory.mineral;
    if (mineralMemory) {
      if (!mineralMemory.structureId && !mineralMemory.structureBuildJobId) {
        const createdSite = RoomConstruction.CreateConstructionSite(
          room,
          mineralMemory.pos,
          STRUCTURE_EXTRACTOR,
          this._executer
        );
        if (createdSite) {
          mineralMemory.structureBuildJobId = createdSite;
        } else {
          const structure = RoomHelper.GetStructureAtLocation(
            room,
            mineralMemory.pos,
            STRUCTURE_EXTRACTOR
          );
          if (structure) {
            mineralMemory.structureId = structure.id;
          }
        }
        return;
      }
      if (mineralMemory.structureBuildJobId) {
        if (Game.time % 100) {
          const createdSite = RoomConstruction.CreateConstructionSite(
            room,
            mineralMemory.pos,
            STRUCTURE_EXTRACTOR,
            this._executer
          );
          if (!createdSite) {
            delete mineralMemory.structureBuildJobId;
          } else {
            mineralMemory.structureBuildJobId = createdSite;
          }
        }
        return;
      }

      if (!mineralMemory.jobId) {
        const mineral = Game.getObjectById<Mineral>(mineralMemory.id);
        const maxCreepsAround = RoomPositionHelper.GetNonWallPositionsAround(
          mineralMemory.pos,
          room
        ).length;
        const jobType: JobTypes = "HarvestMineral";
        const jobDataRepo = new JobData(undefined, jobType, mineralMemory.pos);
        const jobResult = jobDataRepo.InitializeData({
          executer: this._executer,
          pos: mineralMemory.pos,
          targetId: mineralMemory.id,
          type: jobType,
          amountToTransfer: mineral ? mineral.mineralAmount : 0,
          objectType: "Creep",
          maxCreepsCount: maxCreepsAround,
        });
        if (!jobResult.success || !jobResult.cache || !jobResult.memory) return;
        const jobId = JobData.GetJobId(
          jobResult.cache.type,
          jobResult.memory.pos
        );
        if (jobId) {
          mineralMemory.jobId = jobId;
        }
      }

      if (mineralMemory.structureId) {
        const extractor = Game.getObjectById<StructureExtractor | null>(
          mineralMemory.structureId
        );
        if (!extractor) {
          delete mineralMemory.structureId;
        }
      }
    }
  }

  protected ExecuteRoomMineralManager(): void {
    const room = this._roomInformation.room!;
    if ((room.controller ? room.controller.level < 6 : true) || !room.storage)
      return;

    this.UpdateMineral();
  }
}
