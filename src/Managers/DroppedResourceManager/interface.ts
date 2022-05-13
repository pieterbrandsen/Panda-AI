import { forEach } from "lodash";
import RoomHelper from "../BaseModels/Helper/Room/interface";
import RoomData from "../BaseModels/Helper/Room/memory";
import DroppedResourceData from "../BaseModels/Helper/DroppedResource/memory";
import Jobs from "../BaseModels/Jobs/interface";
import JobsHelper from "../BaseModels/Jobs/interface";
import CreepJobs from "../../Executers/Creep/jobs";

export default class RoomDroppedResourceManager {
  protected _executer: string;

  protected _room: Room;

  constructor(id: string, room: Room) {
    this._room = room;
    this._executer = RoomHelper.GetExecuter(id, "DroppedResource");
  }

  private UpdateDroppedResources(): void {
    const droppedResourceMemoryIds = Object.keys(
      DroppedResourceData.GetAllDataBasedOnCache("", false, [this._room.name])
    );
    forEach(droppedResourceMemoryIds, (id) => {
      const resource = Game.getObjectById<Resource | null>(id);
      if (!resource) {
        CreepJobs.DeleteJobData(id);
        const droppedResourceRepo = new DroppedResourceData(id);
        droppedResourceRepo.DeleteData();
      }
    });

    const droppedResources = this._room.find(FIND_DROPPED_RESOURCES);
    forEach(droppedResources, (droppedResource) => {
      const droppedResourceRepo = new DroppedResourceData(droppedResource.id);
      let droppedResourceData = droppedResourceRepo.GetData();
      if (!droppedResourceData.success) {
        droppedResourceData = droppedResourceRepo.InitializeData({
          executer: this._executer,
          resource: droppedResource,
        });
      }

      global.RoomsData[
        this._room.name
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
