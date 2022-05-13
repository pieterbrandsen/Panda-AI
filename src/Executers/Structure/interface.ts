import { forEach } from "lodash";
import StructureHandler from "./structure";

export default class StructuresExecuter {
  public static ExecuteAllStructures(structureIds: Id<Structure>[]): void {
    forEach(structureIds, (id: Id<Structure>) => {
      const structure = Game.getObjectById(id);
      new StructureHandler(id, structure).Execute();
    });
  }
}
