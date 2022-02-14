export default class JobPredicates {
  static IsJobTypes = (jobs: JobTypes[]) => {
    return (cache: JobCache): boolean => {
      return jobs.includes(cache.type);
    };
  };
}
