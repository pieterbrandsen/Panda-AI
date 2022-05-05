import { forEach } from "lodash";
import CreepData from "../../Managers/BaseModels/Helper/Creep/memory";
import CreepHeap from "../../Managers/BaseModels/Heap/creep";
import JobData from "../../Managers/BaseModels/Helper/Job/memory";
import Jobs from "../../Managers/BaseModels/Jobs/interface";
import CreepRoleExecuter from "./roles";
import CreepHandler from "./creep";

export default class CreepsExecuter {
  ExecuteAllCreeps(creepIds: Id<Creep>[]): void {
    forEach(creepIds, (id: Id<Creep>) => {
      const creep = Game.getObjectById(id);
      new CreepHandler(id, creep).Execute();
    });
  }
}
