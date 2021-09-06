export default class JobUpdater {
  public static Run(jobs:Job[]) {
    const deleteJobIds:number[]= [];
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      if (job.nextUpdateTick >= Game.time) {
      switch (job.type) {
        case "harvestMineral":
          if (job.amountLeftToMine === 0)deleteJobIds.push(i);
          job.nextUpdateTick = Game.time + 1000;
          break;

          // skip default case
      }
    }

      
    }

    for (let i = deleteJobIds.length; i > 0; i--) {
      jobs.splice(deleteJobIds[i], 1);
    }
  }
}