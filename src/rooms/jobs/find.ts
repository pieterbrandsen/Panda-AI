import { minBy } from "lodash";
import {
  carryJobTypes,
  pioneerJobTypes,
  workJobTypes,
} from "../../utils/constants/jobTypes";
import JobAssignmentsHelper from "./assign";

export default class JobFinderHelper {
  /**
   * Get all work jobs
   * @param jobs -All jobs to check
   * @returns - List of jobs with work types
   */
  public static GetAllJobs(creepMem: CreepMemory, getAll = false): Job[] {
    const { jobs } = Memory.roomsData.data[
      creepMem.manager.roomName
    ].managersMemory[creepMem.manager.name];
    if (getAll) {
      return jobs;
    }

    switch (creepMem.creepType) {
      case "carry":
        return jobs.filter((j) => carryJobTypes.includes(j.type));
      case "pioneer":
        return jobs.filter((j) => pioneerJobTypes.includes(j.type));
      case "work":
        return jobs.filter((j) => workJobTypes.includes(j.type));
      default:
        return [];
    }
  }

  public static FindNewJob(
    creepMem: CreepMemory,
    assign = true
  ): Job | undefined {
    let jobs = JobFinderHelper.GetAllJobs(creepMem);
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

  public static FindJob(creepMem: CreepMemory): Job | undefined {
    if (!creepMem.job) return undefined;
    const jobs = JobFinderHelper.GetAllJobs(creepMem);
    const jobId = creepMem.job.id;
    return jobs.find((j) => j.id === jobId);
  }
}
