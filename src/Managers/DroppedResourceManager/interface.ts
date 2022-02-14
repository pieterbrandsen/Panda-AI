import { forEach } from "lodash";
import RoomHelper from "../BaseModels/Helper/Room/interface";
import RoomData from "../BaseModels/Helper/Room/memory";
import DroppedResourceData from "../BaseModels/Helper/DroppedResource/memory";
import Jobs from "../BaseModels/Jobs/interface";

export default class SourceManager {
  private updatedMemory = false;

  private executer: string;

  private room: Room;

  private memory: RoomMemory;

  private managerMemory: DroppedResourceManager;

  private cache: RoomCache;

  constructor(roomName: string, roomMemory: RoomMemory, roomCache: RoomCache) {
    this.room = Game.rooms[roomName];
    this.memory = roomMemory;
    this.cache = roomCache;
    this.managerMemory = this.memory.droppedResourceManager;

    this.executer = RoomHelper.GetExecuter(this.room.name, "Source");
  }

  private UpdateDroppedResources(): void {
    const droppedResourceMemoryIds = Object.keys(
      DroppedResourceData.GetAllBasedOnCache("", false, [this.room.name])
    );
    forEach(droppedResourceMemoryIds, (id) => {
      const resource = Game.getObjectById<Resource | null>(id);
      if (!resource) {
        Jobs.Delete(id);
        DroppedResourceData.DeleteMemory(id, true, true);
      }
    });

    const droppedResources = this.room.find(FIND_DROPPED_RESOURCES);
    forEach(droppedResources, (droppedResource) => {
      let droppedResourceData = DroppedResourceData.GetMemory(
        droppedResource.id
      );
      if (!droppedResourceData.success) {
        droppedResourceData = DroppedResourceData.Initialize({
          executer: this.executer,
          resource: droppedResource,
        });
      }

      global.RoomsData[
        this.room.name
      ].stats.energyOutgoing.DroppedEnergyDecay += 1;
      // const droppedResourceMemory = droppedResourceData.memory as DroppedResourceMemory;

      // const jobId = droppedResourceMemory.jobId ?? "";
      // const jobData = IJobData.GetMemory(jobId);
      // if (!jobData.success) {
      //   IJobData.Initialize({
      //     executer: this.executer,
      //     objectType: "Resource",
      //     pos: droppedResource.pos,
      //     targetId: droppedResource.id,
      //     type: "WithdrawResource",
      //     amountToTransfer: droppedResource.amount,
      //     fromTargetId: droppedResource.id,
      //   });
      //   droppedResourceMemory.jobId = jobId;
      //   IDroppedResourceData.UpdateMemory(
      //     droppedResource.id,
      //     droppedResourceMemory
      //   );
      // } else {
      //   const job = jobData.memory as JobMemory;
      //   job.amountToTransfer = droppedResource.amount;
      //   IJobData.UpdateMemory(jobId, job);
      // }
    });
  }

  Run(): void {
    this.UpdateDroppedResources();
    if (this.updatedMemory) {
      RoomData.UpdateMemory(this.room.name, this.memory);
    }
  }
}
