import { forEach, forOwn } from "lodash";
import MemoryInitializer from "../../memory/initialization";
import RoomPositionHelper from "./roomPosition";

/**
 * Get all structures to add them to an manager
 * @param room - The room to initialize the cache for
 */
export default function SetupStructuresCache(room: Room): void {
  const { managersMemory } = Memory.roomsData.data[room.name];
  const groupedStructures = room.find(FIND_STRUCTURES);
  forOwn(managersMemory, (manager, name) => {
    const managerName = name as ManagerNames;
    switch (managerName) {
      case "mineral":
        forEach(
          groupedStructures.filter((s) => s.structureType === "extractor"),
          (structure) => {
            managersMemory[managerName].structures[structure.id] = {
              pos: structure.pos,
              type: structure.structureType,
            };
            MemoryInitializer.SetupStructureMemory(structure.id, {
              name: managerName,
              roomName: room.name,
            });
          }
        );
        break;
      case "source":
        forEach(
          groupedStructures.filter((s) =>
            ([
              STRUCTURE_CONTAINER,
              STRUCTURE_LINK,
            ] as StructureConstant[]).includes(s.structureType)
          ),
          (structure) => {
            const { sources } = managersMemory[managerName];
            forEach(sources, (source) => {
              const pos = RoomPositionHelper.UnfreezeRoomPosition(source.pos);
              if (pos.inRangeTo(structure.pos, 2)) {
                managersMemory[managerName].structures[structure.id] = {
                  pos: structure.pos,
                  type: structure.structureType,
                };
                MemoryInitializer.SetupStructureMemory(structure.id, {
                  name: managerName,
                  roomName: room.name,
                });
              }
            });
          }
        );
        break;
      case "spawn":
        forEach(
          groupedStructures.filter((s) =>
            ([
              STRUCTURE_EXTENSION,
              STRUCTURE_SPAWN,
            ] as StructureConstant[]).includes(s.structureType)
          ),
          (structure) => {
            managersMemory[managerName].structures[structure.id] = {
              pos: structure.pos,
              type: structure.structureType,
            };
            MemoryInitializer.SetupStructureMemory(structure.id, {
              name: managerName,
              roomName: room.name,
            });
          }
        );
        break;

      // skip default case
    }
  });
}
