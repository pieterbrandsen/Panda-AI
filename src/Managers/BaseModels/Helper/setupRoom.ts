import { forEach } from "lodash";
import IRoomHelper from "./roomInterface";
import IRoomData from "./roomMemory";
import IStructureData from "./structureMemory";

interface IRoomSetup {}

export default class implements IRoomSetup {
  static SetupStructures(room: Room): boolean {
    const structures = room.find(FIND_STRUCTURES);
    const roomData = IRoomData.GetMemory(room.name);
    if (!roomData.success) return false;
    const roomMemory = roomData.memory as RoomMemory;
    // const roomCache = roomData.cache as RoomCache;

    forEach(structures, (structure) => {
      let executer = "";
      switch (structure.structureType) {
        case "extractor":
          roomMemory.mineralManager.extractorId = structure.id;
          executer = IRoomHelper.GetExecuter(room.name, "Mineral");
          break;
        case "spawn":
        case "extension":
          executer = IRoomHelper.GetExecuter(room.name, "Spawn");
          break;
        default:
          break;
      }
      IStructureData.Initialize({ executer, structure });
    });

    IRoomData.UpdateMemory(IRoomData.GetId(room.name), roomMemory);
    return true;
  }
}
