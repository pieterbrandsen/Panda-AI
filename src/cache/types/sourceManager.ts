import { forEach, forOwn } from "lodash";
import BaseManager from "./baseManager";

export default function UpdateSourceManagerCache(room: Room): void {
  const cache = Memory.roomsData.data[room.name].managersMemory.source;

  if (Object.keys(cache.sources).length === 0) {
    const sources = room.find(FIND_SOURCES);
    forEach(sources, (source) => {
      cache.sources[source.id] = {
        energy: source.energy,
        pos: source.pos,
      };
    });
  }

  forOwn(cache.sources, (freezedSource: FreezedSource, id: string) => {
    const source = Game.getObjectById<Source>(id as Id<Source>);
    if (source && source.room) {
      freezedSource.energy = source.energy;
    }
  });

  BaseManager(room.name, "source");
}
