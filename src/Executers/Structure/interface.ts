import { forEach } from "lodash";
import StructureData from "../../Managers/BaseModels/Helper/Structure/memory";
import StructureRepair from "../../Managers/BaseModels/Helper/Structure/repair";
import StructureHeap from "../../Managers/BaseModels/Heap/structure";

export default class ExecuteStructures {
  static ExecuteStructure(structure: Structure): boolean {
    const structureData = StructureData.GetMemory(structure.id);
    if (!structureData.success) return false;
    const structureHeapData = StructureHeap.Get(structure.id);
    if (!structureHeapData.success) {
      StructureHeap.Initialize(structure.id);
    }
    const cache = structureData.cache as StructureCache;

    StructureRepair.RepairStructureIfNeeded(structure, cache);
    return true;
  }

  static ExecuterAllStructures(structureIds: string[]): void {
    forEach(structureIds, (id: string) => {
      const structure = Game.getObjectById<Structure | null>(id);
      if (structure) {
        this.ExecuteStructure(structure);
      } else {
        StructureData.DeleteMemory(id, true, true);
      }
    });
  }
}
