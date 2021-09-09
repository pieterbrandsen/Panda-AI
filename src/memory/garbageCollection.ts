import { forOwn } from "lodash";

export default class GarbageCollection {
  /**
   * Delete data in used memory and place it in garbage collection
   * @param object - The object to be added to garbage collection
   * @param key - key of object in memory
   */
  public static CollectRoom(object: RoomMemory, key: string): void {
    Memory.garbageData[key] = {
      data: object,
      deletedAtTick: Game.time + 2000,
      liveObjectType: "room",
    };

    delete Memory.roomsData.data[key];
  }

  /**
   * Insert data into garbage collection
   * @param object - The object to be added to garbage collection
   * @param key - key of object in memory
   * @param type - Type of memory
   */
  public static Collect(
    object: StructureMemory | CreepMemory,
    key: string,
    type: LifeObjectType
  ): void {
    Memory.garbageData[key] = {
      data: object,
      deletedAtTick: Game.time + 1000,
      liveObjectType: type,
    };

    const roomMemory = Memory.roomsData.data[object.manager.roomName];
    switch (type) {
      case "structure":
        delete Memory.structuresData.data[key];
        break;
      case "creep":
        delete Memory.creepsData.data[key];
        break;

      // skip default case
    }
    if (!roomMemory) return;

    const objectManagerMemory: BaseManagerMemory =
      roomMemory.managersMemory[object.manager.name];
    switch (type) {
      case "structure":
        delete objectManagerMemory[key];
        break;
      case "creep":
        delete objectManagerMemory[key];
        break;

      // skip default case
    }
  }

  /**
   * Check all data in garbage collection, remove all expired data and revert non null data
   */
  public static Check(): void {
    forOwn(Memory.garbageData, (value, key) => {
      let liveObject: ObjectTypesInGarbageCollection;
      let memoryObj: StringMap<MemoryTypesInGarbageCollection> | undefined;

      switch (value.liveObjectType) {
        case "structure":
          liveObject = Game.structures[key];
          memoryObj = Memory.structuresData.data;
          break;
        case "creep":
          liveObject = Game.creeps[key];
          memoryObj = Memory.creepsData.data;
          break;

        // skip default case
      }

      if (liveObject !== undefined && memoryObj !== undefined) {
        memoryObj[key] = value.data as MemoryTypesInGarbageCollection;
        delete Memory.garbageData[key];
      } else if (value.deletedAtTick < Game.time) {
        delete Memory.garbageData[key];
      }
    });
  }
}
