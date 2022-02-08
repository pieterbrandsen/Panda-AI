import IRoomMemory from "../BaseModels/Memory/roomInterface";
import IRoomHelper from "../BaseModels/Helper/Room/roomInterface";
import IJobMemory from "../BaseModels/Helper/Job/jobMemory";
import IRoomConstruction from "../BaseModels/Helper/Room/roomConstruction";
import IRoomPosition from "../BaseModels/Helper/Room/roomPosition";

interface IMineralManager {}

export default class implements IMineralManager {
  updatedMemory = false;

  executer: string;

  room: Room;

  memory: RoomMemory;

  managerMemory: MineralManager;

  cache: RoomCache;

  constructor(roomName: string, roomMemory: RoomMemory, roomCache: RoomCache) {
    this.room = Game.rooms[roomName];
    this.memory = roomMemory;
    this.cache = roomCache;
    this.managerMemory = this.memory.mineralManager;

    this.executer = IRoomHelper.GetExecuter(this.room.name, "Controller");
  }

  UpdateMineral(): void {
    const { managerMemory } = this;

    const mineralMemory = managerMemory.mineral;
    if (mineralMemory) {
      if (!mineralMemory.structureId && !mineralMemory.structureBuildJobId) {
        const createdSite = IRoomConstruction.CreateConstructionSite(
          this.room,
          mineralMemory.pos,
          STRUCTURE_EXTRACTOR,
          this.executer
        );
        if (createdSite) {
          mineralMemory.structureBuildJobId = createdSite;
          this.updatedMemory = true;
        } else {
          const structure = IRoomHelper.GetStructureAtLocation(
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
          const createdSite = IRoomConstruction.CreateConstructionSite(
            this.room,
            mineralMemory.pos,
            STRUCTURE_EXTRACTOR,
            this.executer
          );
          if (!createdSite) {
            delete mineralMemory.structureBuildJobId;
            this.updatedMemory = true;
          }
          else { 
            mineralMemory.structureBuildJobId = createdSite;
            this.updatedMemory = true;
          }
        }
        return;
      }

      if (!mineralMemory.jobId) {
        const mineral = Game.getObjectById<Mineral>(mineralMemory.id);
        const maxCreepsAround = IRoomPosition.GetNonWallPositionsAround(
          mineralMemory.pos,
          this.room
        ).length;
        const jobResult = IJobMemory.Initialize({
          executer: this.executer,
          pos: mineralMemory.pos,
          targetId: mineralMemory.id,
          type: "HarvestMineral",
          amountToTransfer: mineral ? mineral.mineralAmount : 0,
          objectType: "Creep",
          maxCreepsCount: maxCreepsAround,
        });
        if (!jobResult.success || !jobResult.cache || !jobResult.memory) return;
        const jobId = IJobMemory.GetJobId(
          jobResult.cache.type,
          jobResult.memory.pos
        );
        if (jobId) {
          mineralMemory.jobId = jobId;
          this.updatedMemory = true;
        }
      }

      if (mineralMemory.structureId) {
        const extractor = Game.getObjectById<StructureExtractor | null>(mineralMemory.structureId);
        if (!extractor) {
          delete mineralMemory.structureId;
          this.updatedMemory = true;
        }
      }
    }
  }

  Run(): void {
    if (this.room.controller ? this.room.controller.level < 6 : true) return;

    this.UpdateMineral();
    if (this.updatedMemory) {
      IRoomMemory.Update(this.room.name, this.memory);
    }
  }
}
