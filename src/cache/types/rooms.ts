import { difference, forEach } from "lodash";
import GarbageCollection from "../../memory/garbageCollection";
import MemoryInitializer from "../../memory/initialization";

export default function UpdateRoomCache(): void {
  const liveRoomNames = Object.keys(Game.rooms);
  const cache = Object.keys(Memory.roomsData.data);

  const lostRoomNames = difference(cache, liveRoomNames);
  const newRoomNames = difference(liveRoomNames, cache);
  forEach(lostRoomNames, (name) => {
    const memory = Memory.roomsData.data[name];
    if (!memory.scout) GarbageCollection.CollectRoom(memory, name);
  });
  forEach(newRoomNames, (name) => {
    MemoryInitializer.SetupRoomMemory(Game.rooms[name]);
  });
}
