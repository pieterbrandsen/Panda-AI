import _ from "lodash";
import GarbageCollection from "../memory/garbageCollection";
import IsStructureType from "../utils/constants/predicate";

export enum CacheType {
  "mineral" = "mineral",
}

export default class CacheManager {
  public static UpdateRoom<T extends Mineral | Structure | Source>(room: Room,cacheType:CacheType): void {
    
    // Find all objects
    let objects: T[] = [];
    switch (cacheType) {
      case "mineral": 
      objects = room.find(FIND_MINERALS) as T[];
      break;
    }
    const cache = Memory.roomsData.data[room.name].cache[cacheType];


    const ids = (objects.map(o => o.id) as string[]).concat(cache.map(c => c.id));
    _.forEach(ids, id => {
      const object = objects.find(o => o.id === id);
      const cacheObject = cache.find(o => o.id === id);
      if (object) {
        if (cacheObject && object.room && object.room.name !== room.name) {
          //GarbageCollection.Collect();
          }
          else if (!cacheObject && object.room && object.room.name === room.name) {
            cache.push({id:id});
          }
      } else {
        if (cacheObject) {
        // GarbageCollection.Collect();
        }
      }
    });
  }
}
