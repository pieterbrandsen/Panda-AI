export default class {
  static IsJobTypes = (jobs: JobTypes[]) => {
    return (cache: JobCache): boolean => {
      return jobs.includes(cache.type);
    };
  };
}
