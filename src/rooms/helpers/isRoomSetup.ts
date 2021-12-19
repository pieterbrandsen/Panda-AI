import { forOwn } from "lodash";

export default function IsRoomSetup(room: Room):boolean {
    const roomMem = Memory.roomsData.data[room.name];
    const managers = roomMem.managersMemory;

    let isSetup = true;
    if (room.energyAvailable <= 1000) isSetup = false;

    forOwn(managers.source.sources,(source,id) => {
        if (source.structure) {
        const sourceStructure = Game.getObjectById(source.structure.id);
        if (!sourceStructure) {
            isSetup = false;
        }
    }
    else isSetup = false;
    })

    if (managers.controller.energyStructure) {
        const controllerStructure = Game.getObjectById(managers.controller.energyStructure.id);
        if (!controllerStructure) {
            isSetup = false;
        }
    }
    else isSetup = false;

    return isSetup;
}
  