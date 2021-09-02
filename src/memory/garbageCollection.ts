export default class GarbageCollection {
  /**
   * Insert data into garbage collection
   * @param object - The object to be added to garbage collection
   * @param key - key of object in memory
   * @param type - Type of memory
   */
  public static Collect(
    object: unknown,
    key: string,
    type: LifeObjectType
  ): void {
    Memory.garbageData.push({
      data: object,
      deletedAtTick: Game.time + 1000,
      liveObjectKey: key,
      liveObjectType: type,
    });

    switch (type) {
      case "room":
        delete Memory.roomsData[key];
        break;
      case "structure":
        delete Memory.structuresData[key];
        break;
      case "creep":
        delete Memory.creepsData[key];
        break;

      // skip default case
    }
  }

  /**
   * Check all data in garbage collection, remove all expired data and revert non null data
   */
  public static Check(): void {
    for (let i = 0; i < Memory.garbageData.length; i += 1) {
      const object = Memory.garbageData[i];
      let liveObject: ObjectTypesInGarbageCollection;
      let memoryObj: StringMap<MemoryTypesInGarbageCollection> | undefined;

      switch (object.liveObjectType) {
        case "room":
          liveObject = Game.rooms[object.liveObjectKey];
          memoryObj = Memory.roomsData.data;
          break;
        case "structure":
          liveObject = Game.structures[object.liveObjectKey];
          memoryObj = Memory.structuresData.data;
          break;
        case "creep":
          liveObject = Game.creeps[object.liveObjectKey];
          memoryObj = Memory.creepsData.data;
          break;
        default:
          liveObject = Game.getObjectById(object.liveObjectKey);
          memoryObj = Memory.creepsData.data;
          break;
      }

      if (liveObject !== undefined && memoryObj !== undefined) {
        memoryObj[
          object.liveObjectKey
        ] = object.data as MemoryTypesInGarbageCollection;
        Memory.garbageData.splice(i, 1);
        i -= 1;
      } else if (object.deletedAtTick < Game.time) {
        Memory.garbageData.splice(i, 1);
        i -= 1;
      }
    }
  }
}
