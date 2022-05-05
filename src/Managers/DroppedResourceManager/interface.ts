import { forEach } from "lodash";
import RoomHelper from "../BaseModels/Helper/Room/interface";
import RoomData from "../BaseModels/Helper/Room/memory";
import DroppedResourceData from "../BaseModels/Helper/DroppedResource/memory";
import Jobs from "../BaseModels/Jobs/interface";

export default class RoomDroppedResourceManager {
  protected _executer: string;
  protected _roomInformation: RoomInformation;

  constructor(roomInformation: RoomInformation) {
    this._roomInformation = roomInformation;
    this._executer = RoomHelper.GetExecuter(roomInformation.room!.name, "DroppedResource");
  }

  private UpdateDroppedResources(): void {
    const room = this._roomInformation.room!;
    const droppedResourceMemoryIds = Object.keys(
      DroppedResourceData.GetAllBasedOnCache("", false, [room.name])
    );
    forEach(droppedResourceMemoryIds, (id) => {
      const resource = Game.getObjectById<Resource | null>(id);
      if (!resource) {
        Jobs.Delete(id);
        DroppedResourceData.DeleteMemory(id, true, true);
      }
    });

    const droppedResources = room.find(FIND_DROPPED_RESOURCES);
    forEach(droppedResources, (droppedResource) => {
      let droppedResourceData = DroppedResourceData.GetMemory(
        droppedResource.id
      );
      if (!droppedResourceData.success) {
        droppedResourceData = DroppedResourceData.Initialize({
          executer: this._executer,
          resource: droppedResource,
        });
      }

      global.RoomsData[
        room.name
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

  protected ExecuteRoomDroppedResourceManager(): void {
    this.UpdateDroppedResources();
  }
}
