import { forEach } from "lodash";
import IRoomHelper from "./roomInterface";
import IRoomData from "./roomMemory";
import IStructureData from "../Structure/structureMemory";
import ICreepData from "../Creep/creepMemory";
import IBodyHelper from "../../CreepSpawning/bodyPartHelper";

interface IRoomSetup {}

export default class implements IRoomSetup {
  static SetupStructures(room: Room): boolean {
    const structures = room.find(FIND_STRUCTURES);
    const creeps = room.find(FIND_MY_CREEPS);
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
        case "controller":
          executer = IRoomHelper.GetExecuter(room.name, "Controller");
          break;
        default:
          break;
      }
      IStructureData.Initialize({ executer, structure });
    });

    forEach(creeps, (creep) => {
      const type = creep.name.split("-")[0] as CreepTypes;
      const roomName = creep.name.split("-")[1];
      const body = creep.body.map((b) => b.type) as BodyPartConstant[];
      const executer = IRoomHelper.GetExecuter(roomName, "Controller");
      const isRemoteCreep =
        IRoomHelper.GetRoomName(executer) !== creep.room.name;
      ICreepData.Initialize({
        body: IBodyHelper.ConvertBodyToStringMap(body),
        isRemoteCreep,
        executer,
        name: creep.name,
        pos: creep.pos,
        type,
      });
    });

    IRoomData.UpdateMemory(IRoomData.GetId(room.name), roomMemory);
    return true;
  }
}
