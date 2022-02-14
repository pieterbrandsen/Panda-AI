import { forEach } from "lodash";
import RoomHelper from "./interface";
import RoomData from "./memory";
import StructureData from "../Structure/memory";
import CreepData from "../Creep/memory";
import BodyHelper from "../../CreepSpawning/bodyPartHelper";

export default class RoomSetup {
  private room: Room;

  private structures: Structure[];

  private creeps: Creep[];

  private roomMemory?: RoomMemory;

  private updatedRoomMemory = false;

  constructor(room: Room) {
    this.room = room;
    this.structures = room.find(FIND_STRUCTURES);
    this.creeps = room.find(FIND_MY_CREEPS);
    const roomData = RoomData.GetMemory(room.name);
    if (!roomData.success) return;
    this.roomMemory = roomData.memory as RoomMemory;
  }

  private SetupStructures(): boolean {
    const { roomMemory } = this;
    if (roomMemory === undefined) return false;

    forEach(this.structures, (structure) => {
      let executer = "";
      let isSource = false;
      switch (structure.structureType) {
        case "extractor":
          if (roomMemory.mineralManager.mineral)
            roomMemory.mineralManager.mineral.structureId = structure.id;
          this.updatedRoomMemory = true;
          executer = RoomHelper.GetExecuter(this.room.name, "Mineral");
          break;
        case "spawn":
        case "extension":
          executer = RoomHelper.GetExecuter(this.room.name, "Spawn");
          break;
        case "controller":
          executer = RoomHelper.GetExecuter(this.room.name, "Controller");
          break;
        case "container": {
          if (
            structure.room.controller &&
            structure.pos.inRangeTo(structure.room.controller.pos, 3)
          ) {
            executer = RoomHelper.GetExecuter(this.room.name, "Controller");
            if (roomMemory.controllerManager.controller)
              roomMemory.controllerManager.controller.structureId =
                structure.id;
            this.updatedRoomMemory = true;
          } else {
            executer = RoomHelper.GetExecuter(this.room.name, "Source");
            const source = this.room
              .find(FIND_SOURCES_ACTIVE)
              .find((s) => s.pos.inRangeTo(structure.pos, 3));
            if (source) {
              const sourceMemory = roomMemory.sourceManager.sources[source.id];
              isSource = true;
              if (sourceMemory) sourceMemory.structureId = structure.id;
              this.updatedRoomMemory = true;
            }
          }
          break;
        }
        default:
          break;
      }
      StructureData.Initialize({ executer, structure, isSource });
    });
    return true;
  }

  private SetupCreeps(): boolean {
    forEach(this.creeps, (creep) => {
      const type = creep.name.split("-")[0] as CreepTypes;
      const roomName = creep.name.split("-")[1];
      const body = creep.body.map((b) => b.type) as BodyPartConstant[];
      const executer = RoomHelper.GetExecuter(roomName, "Controller");
      const isRemoteCreep =
        RoomHelper.GetRoomName(executer) !== creep.room.name;
      CreepData.Initialize({
        body: BodyHelper.ConvertBodyToStringMap(body),
        isRemoteCreep,
        executer,
        id: creep.id,
        pos: creep.pos,
        name: creep.name,
        type,
      });
    });

    return true;
  }

  Initialize(): boolean {
    const roomData = RoomData.Initialize({ room: this.room });
    if (!roomData.success) return false;

    this.roomMemory = roomData.memory as RoomMemory;
    this.SetupStructures();
    this.SetupCreeps();

    forEach(this.room.find(FIND_CONSTRUCTION_SITES), (c) => {
      c.remove();
    });

    if (this.updatedRoomMemory)
      RoomData.UpdateMemory(RoomData.GetId(this.room.name), this.roomMemory);
    return true;
  }
}
