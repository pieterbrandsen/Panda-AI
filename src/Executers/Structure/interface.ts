import { forEach } from "lodash";
import StructureHandler from "./structure";

export default class StructuresExecuter {
  public ExecuteAllStructures(structureIds: Id<Structure>[]): void {
    forEach(structureIds, (id: Id<Structure>) => {
      const structure = Game.getObjectById(id);
      new StructureHandler(id, structure).Execute();
    });
  }
}
