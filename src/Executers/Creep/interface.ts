import { forEach, forOwn } from "lodash";
import ICreepData from "../../Managers/BaseModels/Helper/Creep/creepMemory";
import IJobData from "../../Managers/BaseModels/Helper/Job/jobMemory";
import IJobs from "../../Managers/BaseModels/Jobs/interface";
import ICreepRoleExecuter from "../Roles/interface";

interface ICreepExecuter {}

export default class implements ICreepExecuter {
  static ExecuteCreep(creep: Creep): void {
    const creepData = ICreepData.GetMemory(creep.id);
    if (!creepData.success) {
      return;
    }
    const creepMemory = creepData.memory as CreepMemory;
    const creepCache = creepData.cache as CreepCache;

    creep.say(creepMemory.jobId ?? "none");
    if (creepMemory.jobId) {
      const jobData = IJobData.GetMemory(creepMemory.jobId);
      if (!jobData.success) {
        return;
      }
      const jobMemory = jobData.memory as JobMemory;
      const jobCache = jobData.cache as JobCache;
      new ICreepRoleExecuter(
        creep,
        creepCache,
        creepMemory,
        jobCache,
        jobMemory
      ).run();
    } else {
      IJobs.FindJobForCreep(creep);
    }
  }

  static ExecuterAllCreeps(creeps: StringMap<CreepCache>): void {
    forEach(Object.keys(creeps), (id: string) => {
      const creepData = ICreepData.GetMemory(id);
      if (!creepData.success) {
        return;
      }
      const creepMemory = creepData.memory as CreepMemory;

      const creep: Creep | null = Game.getObjectById(id);
      if (creep) {
        this.ExecuteCreep(creep);
      } else if (!Game.creeps[id]) {
        IJobs.UnassignCreepJob(id,creepMemory,false);
        ICreepData.DeleteMemory(id, true, true);
      }
    });
  }
}
