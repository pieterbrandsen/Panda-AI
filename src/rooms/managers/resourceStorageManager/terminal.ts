import { forEach } from "lodash";
import ResourceLevels from "../../../utils/constants/resourceLevels";

export default class TerminalResourceStorageManager {
  public static Execute(terminal: StructureTerminal): void {
    const roomNames = Object.keys(Memory.roomsData.data);
    const terminals: StructureTerminal[] = [];
    forEach(roomNames, (roomName) => {
      const room = Game.rooms[roomName];
      if (room && room.terminal && room.name !== terminal.room.name)
        terminals.push(room.terminal);
    });
    if (terminals.length === 0) return;

    const controlledResources: ResourceConstant[] = [RESOURCE_ENERGY];
    forEach(controlledResources, (resource) => {
      const thisUsedPercentage =
        (terminal.store[resource] / terminal.store.getCapacity(resource)) * 100;
      let thisStorageLevel = 0;
      if (ResourceLevels.terminal.empty >= thisUsedPercentage)
        thisStorageLevel = -1;
      if (ResourceLevels.terminal.full <= thisUsedPercentage)
        thisStorageLevel = 1;

      const storageLevels: TerminalStorageLevel[] = [];
      forEach(terminals, (ter) => {
        const amount = ter.store[resource];
        const usedPercentage = (amount / ter.store.getCapacity(resource)) * 100;
        let storageLevel = 0;
        if (ResourceLevels.terminal.empty >= usedPercentage) storageLevel = -1;
        if (ResourceLevels.terminal.full <= usedPercentage) storageLevel = 1;
        storageLevels.push({
          amount,
          level: storageLevel,
          range: Game.map.getRoomLinearDistance(
            ter.room.name,
            terminal.room.name,
            true
          ),
          terminal: ter,
        });
      });

      const targetTerminal = ((): TerminalStorageLevel | undefined => {
        let bestWeight = 0;
        let bestResult: TerminalStorageLevel | undefined;
        forEach(storageLevels, (value) => {
          let weight = 0;
          weight += value.range < 20 ? 25 : 0;
          const valueDiff = Math.abs(value.level - thisStorageLevel);
          switch (valueDiff) {
            case 1:
              weight += 25;
              break;
            case 2:
              weight += 50;
              break;

            // skip default case
          }
          if (valueDiff > 0) {
            if (
              weight > bestWeight ||
              (bestResult &&
                weight === bestWeight &&
                value.amount > bestResult.amount)
            ) {
              bestWeight = weight;
              bestResult = value;
            }
          }
        });
        return bestResult;
      })();

      if (!targetTerminal) return;
      if (targetTerminal.level > thisStorageLevel) {
        targetTerminal.terminal.send(
          resource,
          (terminal.store[resource] / 100) * 5,
          terminal.room.name
        );
        //  if (targetTerminal.level < thisStorageLevel)
      } else {
        terminal.send(
          resource,
          (targetTerminal.amount / 100) * 5,
          targetTerminal.terminal.room.name
        );
      }
    });
  }
}
