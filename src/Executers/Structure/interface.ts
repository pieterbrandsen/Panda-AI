import { forEach } from "lodash";
import StructureHandler from "./structure";

export default class ExecuteAllStructures {
  public ExecuteAllStructures(structureIds: Id<Structure>[]): void {
    forEach(structureIds, (id: Id<Structure>) => {
      const structure = Game.getObjectById(id);
      new StructureHandler(structure).Execute();
    });
  }
}
