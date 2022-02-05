import { forEach } from "lodash";
import ICreepData from "../Managers/BaseModels/Helper/Creep/creepMemory";
import IJobs from "../Managers/BaseModels/Jobs/interface";

export default function InitializeSpawnedCreeps(): void {
  forEach(Memory.updateCreepNames, (name, index) => {
    const creep = Game.creeps[name];
    const memoryData = ICreepData.GetMemory(name);
    if (creep && creep.id && memoryData.success) {
      let result = true;
      const creepMemory = memoryData.memory as CreepMemory;
      result = ICreepData.CreateMemory(
        creep.id,
        creepMemory,
        memoryData.cache as CreepCache
      ).success;
      IJobs.UnassignCreepJob(name, creepMemory, false);
      if (result) result = ICreepData.DeleteMemory(name, true, true).success;
      if (result) Memory.updateCreepNames.splice(index, 1);
    } else if (!creep) {
      Memory.updateCreepNames.splice(index, 1);
    }
  });
}
