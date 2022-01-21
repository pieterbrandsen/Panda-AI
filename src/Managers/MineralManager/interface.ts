import IRoomCache from "../BaseModels/Cache/roomInterface";
import IRoomMemory from "../BaseModels/Memory/roomInterface";
import IRoomHelper from "../BaseModels/Helper/roomInterface";
import IJobMemory from "../BaseModels/Helper/jobMemory";

interface IMineralManager {}

export default class implements IMineralManager {
  updatedMemory = false;

  executer: string;

  room: Room;

  memory: RoomMemory;

  managerMemory: MineralManager;

  cache: RoomCache;

  constructor(roomName: string) {
    this.room = Game.rooms[roomName];
    this.memory = IRoomMemory.Get(roomName).data as RoomMemory;
    this.cache = IRoomCache.Get(roomName).data as RoomCache;
    this.managerMemory = this.memory.mineralManager;

    this.executer = IRoomHelper.GetExecuter(this.room.name, "Controller");
  }

  static SetupMemory(room: Room): MineralManager {
    const mineral = room.find(FIND_MINERALS)[0];
    return {
      extractorBuildJobId: undefined,
      extractorId: undefined,
      mineral: mineral
        ? {
            jobId: undefined,
            id: mineral.id,
            pos: IRoomHelper.FreezeRoomPosition(mineral.pos),
            type: mineral.mineralType,
          }
        : undefined,
    };
  }

  UpdateController(): void {
    const { managerMemory } = this;

    const mineralMemory = managerMemory.mineral;
    if (mineralMemory) {
      if (!managerMemory.extractorId && !managerMemory.extractorBuildJobId) {
        const createdSite = IRoomHelper.CreateConstructionSite(
          this.room,
          mineralMemory.pos,
          STRUCTURE_EXTRACTOR,
          this.executer
        );
        if (createdSite) {
          managerMemory.extractorBuildJobId = createdSite;
          this.updatedMemory = true;
        }
        return;
      }
      if (managerMemory.extractorBuildJobId) {
        if (Game.time % 100) {
          const createdSite = IRoomHelper.CreateConstructionSite(
            this.room,
            mineralMemory.pos,
            STRUCTURE_EXTRACTOR,
            this.executer
          );
          if (!createdSite) {
            delete managerMemory.extractorBuildJobId;
            this.updatedMemory = true;
          }
        }
        return;
      }

      if (!mineralMemory.jobId) {
        const mineral = Game.getObjectById<Mineral>(mineralMemory.id);
        const jobResult = IJobMemory.Initialize({
          executer: this.executer,
          pos: mineralMemory.pos,
          targetId: mineralMemory.id,
          type: "HarvestMineral",
          amountToTransfer: mineral ? mineral.mineralAmount : 0,
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
    }
  }

  Run(): void {
    if (this.room.controller ? this.room.controller.level >= 6 : true) return;

    this.UpdateController();
    if (this.updatedMemory) {
      IRoomMemory.Update(this.room.name, this.memory);
    }
  }
}
