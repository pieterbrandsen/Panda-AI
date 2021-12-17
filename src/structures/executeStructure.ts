import GarbageCollection from "../memory/garbageCollection";
import ControlRepairJob from "../rooms/helpers/controlRepairJob";
import ResourceStorageManager from "../rooms/managers/resourceStorageManager/manager";
import LinkStructure from "./types/link";

export default class ExecuteStructure {
  public static Execute(
    cacheStructure: BaseManagerStructureCache,
    id: string,
    managerName: ManagerNames
  ): void {
    const structure = Game.getObjectById<
      | StructureStorage
      | StructureTerminal
      | StructureContainer
      | StructureLink
      | StructureTower
      | StructureSpawn
      | StructureExtension
      | null
    >(id);
    const structureMem = Memory.structuresData.data[id];
    if (structure === null) {
      GarbageCollection.Collect(structureMem, id, "structure");
      return;
    }

    const { jobs } = Memory.roomsData.data[
      cacheStructure.pos.roomName
    ].managersMemory[managerName];
    ResourceStorageManager.ControlStructureResourceLevel(
      structure,
      jobs,
      managerName === "source",
      managerName === "controller",
      managerName === "base"
    );
    ControlRepairJob.ControlDamagedStructure(structure, structureMem.manager);
    switch (cacheStructure.type) {
      case STRUCTURE_LINK:
        LinkStructure.Execute(structure as StructureLink, managerName);
        break;
      // skip default case
    }
  }
}
