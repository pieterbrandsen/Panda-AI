import { forEach } from "lodash";
import JobData from "../../Managers/BaseModels/Helper/Job/memory";
import RoomHelper from "../../Managers/BaseModels/Helper/Room/interface";
import StructureData from "../../Managers/BaseModels/Helper/Structure/memory";
import RoomConstruction from "../../Managers/BaseModels/Helper/Room/construction";
import JobsHelper from "../../Managers/BaseModels/Jobs/interface";
import CreepJobs from "../Creep/jobs";

export default class RoomJobs extends JobsHelper {
  protected _roomInformation: RoomInformation;

  constructor(roomInformation: RoomInformation) {
    super();
    this._roomInformation = roomInformation;
  }

  protected UpdateAllData(): void {
    const { room } = this._roomInformation;
    if (!room) return;
    const jobIds = Object.keys(
      JobData.GetAllDataBasedOnCache("", false, [room.name])
    );
    forEach(jobIds, (id) => {
      RoomJobs.UpdateData(room, id);
    });
  }

  private static UpdateData(room: Room, jobId: string): boolean {
    const jobDataRepo = new JobData(jobId);
    const jobData = jobDataRepo.GetData();
    if (!jobData.success) {
      return false;
    }
    const jobMemory = jobData.memory as JobMemory;
    const jobCache = jobData.cache as JobCache;
    let updatedMemory = false;

    switch (jobCache.type) {
      case "Build":
        {
          const csSite = Game.getObjectById<ConstructionSite | null>(
            jobMemory.targetId
          );
          if (!csSite || (jobMemory.amountToTransfer ?? 0) <= 0) {
            const csSiteAtLocation = RoomConstruction.GetCsSiteAtLocation(
              room,
              jobMemory.pos
            );
            if (csSiteAtLocation) {
              jobMemory.targetId = csSiteAtLocation.id;
              updatedMemory = true;
            } else {
              const structureAtLocation = RoomHelper.GetStructureAtLocation(
                room,
                jobMemory.pos,
                jobMemory.structureType as StructureConstant
              );
              if (structureAtLocation) {
                new StructureData(structureAtLocation.id).InitializeData({
                  executer: jobCache.executer,
                  structure: structureAtLocation,
                });
              }
              CreepJobs.DeleteJobData(jobId);
            }
          } else {
            jobMemory.amountToTransfer = csSite.progressTotal - csSite.progress;
            updatedMemory = true;
          }
        }
        break;
      case "HarvestMineral":
        {
          const mineral = Game.getObjectById<Mineral | null>(
            jobMemory.targetId
          );
          if (!mineral || (jobMemory.amountToTransfer ?? 0) <= 0) {
            CreepJobs.DeleteJobData(jobId);
          } else {
            jobMemory.amountToTransfer = mineral.mineralAmount;
            updatedMemory = true;
          }
        }
        break;
      case "HarvestSource":
        updatedMemory = false;
        break;
      // case "ReserveController": {
      // }
      // break;
      case "TransferSpawn":
      case "TransferStructure":
      case "PickupResource":
      case "WithdrawResource":
        {
          const target = Game.getObjectById<Structure | null>(
            jobMemory.targetId
          );
          if (!target || (jobMemory.amountToTransfer ?? 0) <= 0) {
            CreepJobs.DeleteJobData(jobId);
          }
        }
        break;
      case "UpgradeController":
        {
          const controller = Game.getObjectById<StructureController | null>(
            jobMemory.targetId
          );
          if (!controller || (jobMemory.amountToTransfer ?? 0) <= 10 * 1000) {
            CreepJobs.DeleteJobData(jobId);
          }
        }
        break;
      // skip default case
    }

    if (updatedMemory) {
      jobDataRepo.UpdateData(jobMemory, jobCache);
      return true;
    }
    return false;
  }
}
