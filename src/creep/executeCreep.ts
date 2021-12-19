import GarbageCollection from "../memory/garbageCollection";
import JobFinderHelper from "../rooms/jobs/find";
import PioneerCreep from "./types/pioneer";
import TransfererCreep from "./types/transferer";
import WorkerCreep from "./types/worker";

export default class ExecuteCreep {
  public static Execute(
    cacheCreep: BaseManagerCreepCache,
    id: string,
    managerName: ManagerNames
  ): void {
    const creep = Game.creeps[id];
    const creepMem = Memory.creepsData.data[id];
    if (creep === undefined) {
      GarbageCollection.Collect(creepMem, id, "creep");
      return;
    }
    if (creepMem && creepMem.job) {
    const job = JobFinderHelper.FindJob(creep, creepMem);
      if (job) {
        switch (job.type) {
          case "transfer":
          case "transferSpawning":
          case "withdraw":
            TransfererCreep.Execute(creep, creepMem, job);
            break;
          case "build":
          case "harvestMineral":
          case "harvestSource":
          case "upgrade":
          case "repair":
            WorkerCreep.Execute(creep, creepMem, job);
            break;
          // skip default case
        }
        return;
      }
    }

    JobFinderHelper.FindNewJob(creep, creepMem);
  }
}
