import { minBy } from "lodash";
import {
  carryGetJobType,
  carrySetJobType,
  pioneerSetJobTypes,
  pioneerGetJobTypes,
  workJobTypes,
  harvestJobTypes
} from "../../utils/constants/jobTypes";
import JobAssignmentsHelper from "./assign";

export default class JobFinderHelper {
  /**
   * Get all work jobs
   * @param jobs -All jobs to check
   * @returns - List of jobs with work types
   */
  public static GetAllJobs(
    creep: Creep,
    creepMem: CreepMemory,
    getAll = false
  ): Job[] {
    const { jobs } = Memory.roomsData.data[
      creepMem.manager.roomName
    ].managersMemory[creepMem.manager.name];
    if (getAll) {
      return jobs;
    }

    const hasFreeSpace = creep.store.getFreeCapacity() > 0;
    if (creepMem.manager.name === "pioneer") {
      return jobs.filter((j) =>
        (hasFreeSpace ? pioneerGetJobTypes : pioneerSetJobTypes).includes(
          j.type
        )
      );
    }

    switch (creepMem.creepType) {
      case "carry":
        return jobs.filter((j) =>
          hasFreeSpace ? carryGetJobType : carrySetJobType === j.type
        );
      case "work": 
        return jobs.filter((j) =>
        (hasFreeSpace ? workJobTypes : ["withdraw"]).includes(j.type)
        );
        case "harvest": 
        return jobs.filter((j) =>
        (hasFreeSpace ? harvestJobTypes : ["transfer"]).includes(j.type)
        );
        default:
        return [];
    }
  }

  public static FindNewJob(
    creep: Creep,
    creepMem: CreepMemory,
    assign = true
  ): Job | undefined {
    let jobs = JobFinderHelper.GetAllJobs(creep, creepMem);
    const priorityJobs = jobs.filter((j) => j.hasPriority);
    if (priorityJobs.length > 0) jobs = priorityJobs;
    const job = minBy(jobs, (j) => j.latestStructureOrCreepAssignedAtTick);
    if (job && assign) {
      if (
        !JobAssignmentsHelper.AssignJob(
          creepMem,
          job,
          creepMem.manager.roomName
        )
      )
        return undefined;
    }

    return job;
  }

  public static FindJob(creep: Creep, creepMem: CreepMemory): Job | undefined {
    if (!creepMem.job) return undefined;
    const jobs = JobFinderHelper.GetAllJobs(creep, creepMem);
    const jobId = creepMem.job.id;
    return jobs.find((j) => j.id === jobId);
  }
}
