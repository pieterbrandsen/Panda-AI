import { GetRepairAmount } from "../../utils/constants/predicate";

export default class JobUpdater {
  /**
   * Update all jobs out of the array
   * @param jobs - Jobs to be checked for updating
   */
  public static Run(jobs: Job[]): void {
    for (let i = 0; i < jobs.length; i += 1) {
      const job = jobs[i];
      if (Game.time >= job.nextUpdateTick) {
        switch (job.type) {
          case "harvestSource": {
            const source = Game.getObjectById<Source>(job.targetId);
            if (source === null) {
              break;
            }
            job.amountLeft = source.energy;
            break;
          }
          case "harvestMineral": {
            const mineral = Game.getObjectById<Mineral>(job.targetId);
            if (mineral === null) {
              break;
            }
            job.amountLeft = mineral.mineralAmount;
            break;
          }
          case "repair": {
            const structure = Game.getObjectById<Structure>(job.targetId);
            if (structure === null) {
              break;
            }
            job.amountLeft = GetRepairAmount(
              job.requiredPercentage as number,
              structure.hits,
              structure.hitsMax
            );
            break;
          }
          case "transfer":
          case "transferSpawning":
          case "withdraw": {
            const structure = Game.getObjectById<StructureStorage>(
              job.targetId
            );
            if (structure === null) {
              break;
            }

            const resourceType = job.resourceType as ResourceConstant;
            const usedStorage = structure.store[resourceType];
            const maxStorage = structure.store.getCapacity(
              resourceType
            ) as number;
            const storageLevel = Math.floor((usedStorage / maxStorage) * 100);
            const difference =
              job.type === "transfer"
                ? (job.requiredPercentage as number) - storageLevel
                : storageLevel - (job.requiredPercentage as number);

            job.amountLeft = Math.floor((difference / 100) * maxStorage);
            if (job.amountLeft < 0) job.amountLeft = 0;
            break;
          }

          // skip default case
        }
        job.nextUpdateTick = Game.time + 10;
      }
    }
  }
}
