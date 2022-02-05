import JobConstants from "./constants";

interface IJobHelper {}

export default class implements IJobHelper {
  static GetJobStatsType(type: JobTypes): JobTypeTypes {
    if (JobConstants.IncomingJobTypes.includes(type as IncomingJobTypes))
      return "Incoming";
    if (JobConstants.OutgoingJobTypes.includes(type as OutgoingJobTypes))
      return "Outgoing";
    if (JobConstants.OtherJobTypes.includes(type as OtherJobTypes))
      return "Other";
    return "Other";
  }
}
