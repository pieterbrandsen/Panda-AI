import { forEach, remove } from "lodash";
import JobData from "../Helper/Job/memory";
import RoomData from "../Helper/Room/memory";
import Predicates from "./predicates";
import RoomHelper from "../Helper/Room/interface";
import JobHelper from "../Helper/Job/helper";

// TODO: Update (all/single)
// TODO: GenerateObject (update whenever something needs to be added, assign in this function the missing data that is optional?)
// *^ LATER

export default class JobsHelper {
  protected static RemoveAssignedCreepOutOfArray(
    array: string[],
    key: string
  ): string[] {
    remove(array, (e) => e === key);
    return array;
  }

  public static UpdateAmount(
    jobId: string,
    memory: JobMemory,
    cache: JobCache,
    amount: number,
    sendStats = false
  ): boolean {
    if (memory.amountToTransfer) {
      memory.amountToTransfer -= amount;
    }
    const jobDataRepo = new JobData(jobId);

    if (!sendStats) return jobDataRepo.UpdateData(memory, cache).success;

    const roomName = RoomHelper.GetRoomName(cache.executer);
    const globalRoomData = new RoomData(roomName).HeapDataRepository.GetData();
    if (globalRoomData.success) {
      const globalRoom = globalRoomData.data as RoomHeap;
      const jobStatsType = JobHelper.GetJobStatsType(cache.type);
      if (jobStatsType === "Incoming") {
        globalRoom.stats.energyIncoming[cache.type] += amount;
      } else if (jobStatsType === "Outgoing") {
        let amountExpense = amount;
        if (cache.type === "Repair") amountExpense /= 100;
        else if (cache.type === "Build") amountExpense /= 5;
        globalRoom.stats.energyOutgoing[cache.type] += amountExpense;
      }
    }
    return jobDataRepo.UpdateData(memory, cache).success;
  }

  public static MoveJob(
    jobId: string,
    type: "Room" | "Manager",
    newExecuter: string
  ): DoubleCRUDResult<JobMemory, JobCache> {
    const jobDataRepo = new JobData(jobId);
    const jobData = jobDataRepo.GetData();
    if (!jobData.success) {
      return { success: false, memory: undefined, cache: undefined };
    }
    const jobCache = jobData.cache as JobCache;
    const room =
      type === "Room" ? newExecuter : RoomHelper.GetRoomName(jobCache.executer);
    const manager =
      type === "Manager"
        ? newExecuter
        : RoomHelper.GetManagerName(jobCache.executer);
    jobCache.executer = RoomHelper.GetExecuter(room, manager as ManagerTypes);
    return jobDataRepo.UpdateData(jobData.memory as JobMemory, jobCache);
  }

  protected static GetJobScore(memory: JobMemory): number {
    if (memory.assignedCreeps.length >= (memory.maxCreepsCount ?? 100))
      return 0;

    let score = 0;
    score += (Game.time / memory.lastAssigned - 1) * Game.time;
    // if (memory.maxCreepsCount) {
    //  score += memory.assignedCreeps.length / memory.maxCreepsCount;
    // }
    return score;
  }

  protected static FindBestJob(jobIds: string[]): string | undefined {
    let bestJobId: string | undefined;
    let bestScore = 0;
    forEach(jobIds, (jobId: string) => {
      const jobData = new JobData(jobId).GetData();
      if (jobData.success) {
        const jobMemory = jobData.memory as JobMemory;
        const score = this.GetJobScore(jobMemory);
        if (score > 0 && score > bestScore) {
          bestScore = score;
          bestJobId = jobId;
        }
      }
    });

    return bestJobId;
  }

  protected static FindNewJob(
    executer: string,
    jobTypes: JobTypes[],
    roomNames: string[]
  ): { id: string; cache: JobCache } | undefined {
    let jobs = JobData.GetAllDataBasedOnCache(
      executer,
      true,
      roomNames,
      Predicates.IsJobTypes(jobTypes)
    );
    let jobId = this.FindBestJob(Object.keys(jobs));
    if (jobId !== undefined) {
      return { id: jobId, cache: jobs[jobId].cache as JobCache };
    }

    jobs = JobData.GetAllDataBasedOnCache(
      "",
      false,
      roomNames,
      Predicates.IsJobTypes(jobTypes)
    );
    jobId = this.FindBestJob(Object.keys(jobs));
    if (jobId !== undefined) {
      return { id: jobId, cache: jobs[jobId].cache as JobCache };
    }
    return undefined;
  }

  protected static GetJobTypesToExecute(
    creep: Creep,
    creepType: CreepTypes
  ): JobTypes[] {
    if (creep.store.getUsedCapacity() > 0) {
      switch (creepType) {
        case "miner": {
          return ["TransferStructure"];
        }
        case "worker":
          return ["Build", "UpgradeController", "Repair"];
        case "transferer":
          return ["TransferStructure", "TransferSpawn"];
        // skip default case
      }
    } else {
      switch (creepType) {
        case "miner":
          return ["HarvestMineral", "HarvestSource"];
        case "worker":
        case "transferer":
          return ["TransferStructure"];
        case "claimer":
          return ["ReserveController"];
        // skip default case
      }
    }
    return [];
  }
}
