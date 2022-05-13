import { forEach } from "lodash";
import CreepHandler from "./creep";

export default class CreepsExecuter {
  public static ExecuteAllCreeps(creepIds: Id<Creep>[]): void {
    forEach(creepIds, (id: Id<Creep>) => {
      const creep = Game.getObjectById(id);
      new CreepHandler(id, creep).Execute();
    });
  }
}
