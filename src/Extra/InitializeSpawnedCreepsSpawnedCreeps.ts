/* eslint class-methods-use-this: ["error", { "exceptMethods": ["InitializeCreep"] }] */
import { forEach } from "lodash";
import CreepJobs from "../Executers/Creep/jobs";
import CreepData from "../Managers/BaseModels/Helper/Creep/memory";
import Jobs from "../Managers/BaseModels/Jobs/interface";

export default class InitializeSpawnedCreeps {
  private InitializeCreep(
    creep: Creep,
    memoryData: DoubleCRUDResult<CreepMemory, CreepCache>
  ): boolean {
    let result = true;
    const creepMemory = memoryData.memory as CreepMemory;
    const creepRepo = new CreepData(creep.id);
    result = new CreepData(creep.id).CreateData(
      creepMemory,
      memoryData.cache as CreepCache
    ).success;
    new CreepJobs({creep,id:creep.name,memory:creepMemory,cache:memoryData.cache}).UnassignJob(false);
    if (result) result = new CreepData(creep.name).DeleteData().success;
    return result;
  }

  public Handle(): void {
    forEach(Memory.updateCreepNames, (name, index) => {
      const creep = Game.creeps[name];
      const creepData = new CreepData(name).GetData();
      if (creep && creepData.success) {
        const result = this.InitializeCreep(creep, creepData);
        if (result) Memory.updateCreepNames.splice(index, 1);
      } else Memory.updateCreepNames.splice(index, 1);
    });
  }
}
