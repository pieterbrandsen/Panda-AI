import { forEach } from "lodash";
import IRoomMemory from "../BaseModels/Memory/roomInterface";
import IRoomHelper from "../BaseModels/Helper/Room/roomInterface";
import IDroppedResourceData from "../BaseModels/Helper/DroppedResource/droppedResourceMemory";
import IDroppedResourceCache from "../BaseModels/Cache/droppedResourceInterface";
import IJobs from "../BaseModels/Jobs/interface";

interface ISourceManager {}

export default class implements ISourceManager {
  updatedMemory = false;

  executer: string;

  room: Room;

  memory: RoomMemory;

  managerMemory: DroppedResourceManager;

  cache: RoomCache;

  constructor(roomName: string, roomMemory: RoomMemory, roomCache: RoomCache) {
    this.room = Game.rooms[roomName];
    this.memory = roomMemory;
    this.cache = roomCache;
    this.managerMemory = this.memory.droppedResourceManager;

    this.executer = IRoomHelper.GetExecuter(this.room.name, "Source");
  }

  UpdateDroppedResources(): void {
    const droppedResourceMemoryIds = Object.keys(
      IDroppedResourceCache.GetAll("", false, [this.room.name])
    );
    forEach(droppedResourceMemoryIds, (id) => {
      const resource = Game.getObjectById<Resource | null>(id);
      if (!resource) {
        IJobs.Delete(id);
        IDroppedResourceData.DeleteMemory(id, true, true);
      }
    });

    const droppedResources = this.room.find(FIND_DROPPED_RESOURCES);
    forEach(droppedResources, (droppedResource) => {
      let droppedResourceData = IDroppedResourceData.GetMemory(
        droppedResource.id
      );
      if (!droppedResourceData.success) {
        droppedResourceData = IDroppedResourceData.Initialize({
          executer: this.executer,
          resource: droppedResource,
        });
      }
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
      IRoomMemory.Update(this.room.name, this.memory);
    }
  }
}
