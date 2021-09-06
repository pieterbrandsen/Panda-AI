import { minBy } from "lodash";
import { WorkJobTypes } from "../../../utils/constants/jobTypes";

export default class WorkJobHelper {
  public static GetAllJobs(jobs:Job[]):Job[] {
    return jobs.filter(j => WorkJobTypes.includes(j.type));
  }
  public static FindNewJob(jobs:Job[]):Job | undefined {
    const workJobs = WorkJobHelper.GetAllJobs(jobs);
    return minBy(workJobs, j => j.latestStructureOrCreepAssignedAtTick);
  }
}