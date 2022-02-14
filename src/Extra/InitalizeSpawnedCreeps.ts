import { forEach } from "lodash";
import CreepData from "../Managers/BaseModels/Helper/Creep/memory";
import Jobs from "../Managers/BaseModels/Jobs/interface";

export default function InitializeSpawnedCreeps(): void {
  forEach(Memory.updateCreepNames, (name, index) => {
    const creep = Game.creeps[name];
    const memoryData = CreepData.GetMemory(name);
    if (creep && creep.id && memoryData.success) {
      let result = true;
      const creepMemory = memoryData.memory as CreepMemory;
      result = CreepData.CreateMemory(
        creep.id,
        creepMemory,
        memoryData.cache as CreepCache
      ).success;
      Jobs.UnassignCreepJob(name, creepMemory, false);
      if (result) result = CreepData.DeleteMemory(name, true, true).success;
      if (result) Memory.updateCreepNames.splice(index, 1);
    } else if (!creep) {
      Memory.updateCreepNames.splice(index, 1);
    }
  });
}
