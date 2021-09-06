import { minBy } from "lodash";
import WorkJobTypes from "../../../utils/constants/jobTypes";

export default class WorkJobHelper {
  /**
   * Get all work jobs
   * @param jobs -All jobs to check
   * @returns - List of jobs with work types
   */
  public static GetAllJobs(jobs: Job[]): Job[] {
    return jobs.filter((j) => WorkJobTypes.includes(j.type));
  }

  /**
   * Find new job that is the longest not used
   * @param jobs - All jobs to check for work typed jobs
   * @returns
   */
  public static FindNewJob(jobs: Job[]): Job | undefined {
    const workJobs = WorkJobHelper.GetAllJobs(jobs).filter((j) => j.available);
    return minBy(workJobs, (j) => j.latestStructureOrCreepAssignedAtTick);
  }
}
