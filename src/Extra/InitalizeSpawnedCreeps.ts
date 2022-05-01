/* eslint class-methods-use-this: ["error", { "exceptMethods": ["InitializeCreep"] }] */
import { forEach } from "lodash";
import CreepData from "../Managers/BaseModels/Helper/Creep/memory";
import Jobs from "../Managers/BaseModels/Jobs/interface";

export default class InitializeSpawnedCreeps {
  private InitializeCreep(
    creep: Creep,
    memoryData: DoubleCRUDResult<CreepMemory, CreepCache>
  ): boolean {
    let result = true;
    const creepMemory = memoryData.memory as CreepMemory;
    result = CreepData.CreateMemory(
      creep.id,
      creepMemory,
      memoryData.cache as CreepCache
    ).success;
    Jobs.UnassignCreepJob(creep.name, creepMemory, false);
    if (result) result = CreepData.DeleteMemory(creep.name, true, true).success;
    return result;
  }

  public Handle(): void {
    forEach(Memory.updateCreepNames, (name, index) => {
      const creep = Game.creeps[name];
      const memoryData = CreepData.GetMemory(name);
      if (creep && memoryData.success) {
        const result = this.InitializeCreep(creep, memoryData);
        if (result) Memory.updateCreepNames.splice(index, 1);
      } else Memory.updateCreepNames.splice(index, 1);
    });
  }
}
