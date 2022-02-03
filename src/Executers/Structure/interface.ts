import { forOwn } from "lodash";
import IStructureData from "../../Managers/BaseModels/Helper/Structure/structureMemory";
import IStructureRepair from "../../Managers/BaseModels/Helper/Structure/structureRepair";

interface IExecuteStructures {}

export default class implements IExecuteStructures {
  static ExecuteStructure(structure: Structure, cache: StructureCache): void {
    IStructureRepair.RepairStructureIfNeeded(structure, cache);
  }

  static ExecuterAllStructures(structures: StringMap<StructureCache>): void {
    forOwn(structures, (cache: StructureCache, id: string) => {
      const structure = Game.getObjectById<Structure | null>(id);
      if (structure) {
        this.ExecuteStructure(structure, cache);
      } else {
        IStructureData.DeleteMemory(id, true, true);
      }
    });
  }
}
