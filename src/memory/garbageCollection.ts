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

    if ((object as CreepMemory).creepType) {
      delete Memory.creepsData.data[key];
    }
    else { 
      delete Memory.structuresData.data[key];
    }
    const roomMemory = Memory.roomsData.data[object.manager.roomName];
    if (!roomMemory) return;

    if ((object as CreepMemory).creepType) {
      delete roomMemory.managersMemory[object.manager.name].creeps[key];
      delete Memory.creeps[key];
    }
    else { 
      delete roomMemory.managersMemory[object.manager.name].structures[key];
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
        case "room":
          liveObject = Game.rooms[key];
          memoryObj = Memory.roomsData.data;
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
