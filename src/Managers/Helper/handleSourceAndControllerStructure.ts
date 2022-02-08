import IRoomConstruction from "../BaseModels/Helper/Room/roomConstruction";
import IRoomPosition from "../BaseModels/Helper/Room/roomPosition";
import IRoomHelper from "../BaseModels/Helper/Room/roomInterface";
import IRoomMemory from "../BaseModels/Memory/roomInterface";
import IResourceStorage from "../BaseModels/ResourceStorage/interface";
import IStructureData from "../BaseModels/Helper/Structure/structureMemory";

export default function HandleSourceAndControllerStructure(
  target: Source | StructureController,
  memory: SourceMemory | ControllerMemory,
  type: "source" | "controller",
  executer: string,
  controller?: StructureController
): void {
  if (controller && controller.level <= 2) return;
  const structureType: BuildableStructureConstant =
    controller && controller.level >= 7 ? STRUCTURE_LINK : STRUCTURE_CONTAINER;
  const range = type === "controller" || structureType === "link" ? 2 : 1;
  let updatedMemory = false;

  if (!memory.structureId && !memory.structureBuildJobId) {
    const bestPosition = IRoomPosition.FindBestPosInRange(
      target.room,
      target.pos,
      range,
      type
    );
      if (bestPosition) {
      const createdSite = IRoomConstruction.CreateConstructionSite(
        target.room,
        bestPosition,
        structureType,
        executer
      );
      if (createdSite) {
        memory.structureBuildJobId = createdSite;
        updatedMemory = true;
      } else {
        const structure = IRoomHelper.GetStructureAtLocation(
          target.room,
          bestPosition,
          structureType
        );
        if (structure) {
          memory.structureId = structure.id;
          memory.structureType = structure.structureType as BuildableStructureConstant;
          updatedMemory = true;
        }
      }
    }
  }

  if (memory.structureBuildJobId) {
    if (Game.time % 100) {
      const createdSite = IRoomConstruction.CreateConstructionSite(
        target.room,
        memory.pos,
        structureType,
        executer
      );
      if (!createdSite) {
        delete memory.structureBuildJobId;
        updatedMemory = true;
      } else {
        memory.structureBuildJobId = createdSite;
        updatedMemory = true;
      }
    }
    return;
  }

  if (memory.structureId) {
    const structure = Game.getObjectById<
      null | StructureContainer | StructureLink
    >(memory.structureId);
    if (structure && structure.structureType === "container") {
      const resourceStorage = new IResourceStorage(
        structure as StructuresWithStorage,
        "Structure",
        executer
      );
      if (type === "controller") {
        resourceStorage.Manage(false, true);
      } else {
        resourceStorage.Manage(true, false);
      }
    } else {
      delete memory.structureId;
      delete memory.structureBuildJobId;
      updatedMemory = true;
    }
  }

  if (updatedMemory && type === "controller") {
    IRoomMemory.UpdateControllerMemory(
      target.room.name,
      memory as ControllerMemory
    );
  } else if (updatedMemory && type === "source") {
    const structureData = IStructureData.GetMemory(memory.structureId ?? "");
    if (structureData.success) {
      const structureMemory = structureData.memory as StructureMemory;
      structureMemory.isSourceStructure = true;
    }
    IRoomMemory.UpdateSourceMemory(
      target.room.name,
      target.id,
      memory as SourceMemory
    );
  }
  return;
}
