import { forEach } from "lodash";
import CreepData from "../../Managers/BaseModels/Helper/Creep/memory";
import CreepHeap from "../../Managers/BaseModels/Heap/creep";
import JobData from "../../Managers/BaseModels/Helper/Job/memory";
import Jobs from "../../Managers/BaseModels/Jobs/interface";
import CreepRoleExecuter from "./Roles/interface";

export default class CreepExecuter {
  static ExecuteCreep(creep: Creep): void {
    const creepData = CreepData.GetMemory(creep.id);
    if (!creepData.success) {
      return;
    }
    const creepMemory = creepData.memory as CreepMemory;
    const creepCache = creepData.cache as CreepCache;

    creep.say(creepMemory.jobId ?? "none");
    if (creepMemory.jobId) {
      const jobData = JobData.GetMemory(creepMemory.jobId);
      if (!jobData.success) {
        return;
      }
      const jobMemory = jobData.memory as JobMemory;
      const jobCache = jobData.cache as JobCache;
      new CreepRoleExecuter(
        creep,
        creepCache,
        creepMemory,
        jobCache,
        jobMemory
      ).run();
    } else {
      Jobs.FindJobForCreep(creep);
    }
  }

  static ExecuterAllCreeps(creepIds: string[]): void {
    forEach(creepIds, (id: string) => {
      const creepData = CreepData.GetMemory(id);
      if (!creepData.success) {
        return;
      }
      const creepHeapData = CreepHeap.Get(id);
      if (!creepHeapData.success) {
        CreepHeap.Initialize(id);
      }

      const creepMemory = creepData.memory as CreepMemory;

      const creep: Creep | null = Game.getObjectById(id);
      if (creep) {
        this.ExecuteCreep(creep);
      } else if (!Game.creeps[id]) {
        Jobs.UnassignCreepJob(id, creepMemory, false);
        CreepData.DeleteMemory(id, true, true);
      }
    });
  }
}
