import RoomHelper from "../BaseModels/Helper/Room/interface";
import JobData from "../BaseModels/Helper/Job/memory";
import RoomData from "../BaseModels/Helper/Room/memory";
import RoomConstruction from "../BaseModels/Helper/Room/construction";
import RoomPositionHelper from "../BaseModels/Helper/Room/position";

export default class MineralManager {
  private updatedMemory = false;

  private executer: string;

  private room: Room;

  private memory: RoomMemory;

  private managerMemory: MineralManagerMemory;

  private cache: RoomCache;

  constructor(roomName: string, roomMemory: RoomMemory, roomCache: RoomCache) {
    this.room = Game.rooms[roomName];
    this.memory = roomMemory;
    this.cache = roomCache;
    this.managerMemory = this.memory.mineralManager;

    this.executer = RoomHelper.GetExecuter(this.room.name, "Controller");
  }

  private UpdateMineral(): void {
    const { managerMemory } = this;

    const mineralMemory = managerMemory.mineral;
    if (mineralMemory) {
      if (!mineralMemory.structureId && !mineralMemory.structureBuildJobId) {
        const createdSite = RoomConstruction.CreateConstructionSite(
          this.room,
          mineralMemory.pos,
          STRUCTURE_EXTRACTOR,
          this.executer
        );
        if (createdSite) {
          mineralMemory.structureBuildJobId = createdSite;
          this.updatedMemory = true;
        } else {
          const structure = RoomHelper.GetStructureAtLocation(
            this.room,
            mineralMemory.pos,
            STRUCTURE_EXTRACTOR
          );
          if (structure) {
            mineralMemory.structureId = structure.id;
            this.updatedMemory = true;
          }
        }
        return;
      }
      if (mineralMemory.structureBuildJobId) {
        if (Game.time % 100) {
          const createdSite = RoomConstruction.CreateConstructionSite(
            this.room,
            mineralMemory.pos,
            STRUCTURE_EXTRACTOR,
            this.executer
          );
          if (!createdSite) {
            delete mineralMemory.structureBuildJobId;
            this.updatedMemory = true;
          } else {
            mineralMemory.structureBuildJobId = createdSite;
            this.updatedMemory = true;
          }
        }
        return;
      }

      if (!mineralMemory.jobId) {
        const mineral = Game.getObjectById<Mineral>(mineralMemory.id);
        const maxCreepsAround = RoomPositionHelper.GetNonWallPositionsAround(
          mineralMemory.pos,
          this.room
        ).length;
        const jobResult = JobData.Initialize({
          executer: this.executer,
          pos: mineralMemory.pos,
          targetId: mineralMemory.id,
          type: "HarvestMineral",
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
          this.updatedMemory = true;
        }
      }

      if (mineralMemory.structureId) {
        const extractor = Game.getObjectById<StructureExtractor | null>(
          mineralMemory.structureId
        );
        if (!extractor) {
          delete mineralMemory.structureId;
          this.updatedMemory = true;
        }
      }
    }
  }

  Run(): void {
    if (
      (this.room.controller ? this.room.controller.level < 6 : true) ||
      !this.room.storage
    )
      return;

    this.UpdateMineral();
    if (this.updatedMemory) {
      RoomData.UpdateMemory(this.room.name, this.memory);
    }
  }
}
