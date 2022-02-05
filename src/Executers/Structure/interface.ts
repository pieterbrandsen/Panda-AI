import { forEach } from "lodash";
import IStructureData from "../../Managers/BaseModels/Helper/Structure/structureMemory";
import IStructureRepair from "../../Managers/BaseModels/Helper/Structure/structureRepair";
import IStructureHeap from "../../Managers/BaseModels/Heap/structureInterface";

interface IExecuteStructures {}

export default class implements IExecuteStructures {
  static ExecuteStructure(structure: Structure): boolean {
    const structureData = IStructureData.GetMemory(structure.id);
    if (!structureData.success) return false;
    const structureHeapData = IStructureHeap.Get(structure.id);
    if (!structureHeapData.success) {
      IStructureHeap.Initialize(structure.id);
    }
    const cache = structureData.cache as StructureCache;

    IStructureRepair.RepairStructureIfNeeded(structure, cache);
    return true;
  }

  static ExecuterAllStructures(structures: StringMap<StructureCache>): void {
    forEach(Object.keys(structures), (id: string) => {
      const structure = Game.getObjectById<Structure | null>(id);
      if (structure) {
        this.ExecuteStructure(structure);
      } else {
        IStructureData.DeleteMemory(id, true, true);
      }
    });
  }
}
