export default class JobUpdater {
  /**
   * Update all jobs out of the array
   * @param jobs - Jobs to be checked for updating
   */
  public static Run(jobs: Job[]): void {
    const deleteJobIds: number[] = [];
    for (let i = 0; i < jobs.length; i += 1) {
      const job = jobs[i];
      if (job.nextUpdateTick >= Game.time) {
        switch (job.type) {
          case "harvestMineral":
            if (job.amountLeftToMine === 0) deleteJobIds.push(i);
            job.nextUpdateTick = Game.time + 1000;
            break;

          // skip default case
        }
      }
    }

    for (let i = deleteJobIds.length; i > 0; i -= 1) {
      jobs.splice(deleteJobIds[i], 1);
    }
  }
}
