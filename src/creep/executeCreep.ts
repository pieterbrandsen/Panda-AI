import GarbageCollection from "../memory/garbageCollection";
import ControlRepairJob from "../rooms/helpers/controlRepairJob";
import ResourceStorageManager from "../rooms/managers/resourceStorageManager/manager";
import PioneerCreep from "./types/pioneer";
import TransfererCreep from "./types/transferer";
import WorkerCreep from "./types/worker";

export default class ExecuteCreep {
  public static Execute(
    cacheCreep: BaseManagerCreepCache,
    id: string,
    managerName: ManagerNames
  ): void {
    const creep = Game.getObjectById<Creep | null>(id);
    const creepMem = Memory.creepsData.data[id];
    if (creep === null) {
      GarbageCollection.Collect(creepMem, id, "creep");
      return;
    }

    const { jobs } = Memory.roomsData.data[creep.room.name].managersMemory[
      managerName
    ];
    if (creepMem && creepMem.job) {
      const jobId = creepMem.job.id;
      const job = jobs.find((job) => job.id === jobId);
      if (job) {
        switch (job.type) {
          case "pioneer":
            PioneerCreep.Execute(creep, creepMem);
            break;
          case "transfer":
            TransfererCreep.Execute(creep, creepMem, job.type);
            break;
          case "transferSpawning":
            TransfererCreep.Execute(creep, creepMem, job.type);
            break;
          case "build":
            WorkerCreep.Execute(creep, creepMem, job.type);
            break;
          // skip default case
        }
        return;
      }
    }

    // Find new job
  }
}
