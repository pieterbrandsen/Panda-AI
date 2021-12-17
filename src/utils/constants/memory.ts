/*
  Object with VersionedMemoryName
*/
const rootVersion = -1;
export const VersionedMemoryObjects: VersionedMemory = {
  Heap: 0,
  Root: rootVersion,
  Room: 0,
  Creep: 0,
  Structure: 0,
};

export enum VersionedMemoryTypeName {
  "Heap" = "Heap",
  "Root" = "Root",
  "Room" = "Room",
  "Structure" = "Structure",
  "Creep" = "Creep",
}

export const DefaultRootMemory: RootMemory = {
  creepsData: {
    data: {},
    version: -1,
  },
  structuresData: {
    data: {},
    version: -1,
  },
  roomsData: {
    data: {},
    version: -1,
  },
  garbageData: {},
  version: rootVersion,
};

export function DefaultRoomMemory(name: string): RoomMemory {
  return {
    isSpawningPioneers: false,
    managersMemory: {
      mineral: {
        jobs: [],
        creeps: {},
        structures: {},
        mineral: {
          id: "",
          amount: 0,
          type: "H",
          pos: { x: 0, y: 0, roomName: name },
        },
        constructionSites: {},
      },
      spawn: {
        jobs: [],
        creeps: {},
        structures: {},
        constructionSites: {},
        queue: [],
        lastSpawnedType: "work",
      },
      pioneer: {
        jobs: [],
        creeps: {},
        structures: {},
        constructionSites: {},
        isActive: true,
      },
      source: {
        jobs: [],
        creeps: {},
        structures: {},
        constructionSites: {},
        sources: {},
      },
      base: {
        jobs: [],
        creeps: {},
        structures: {},
        constructionSites: {},
      },
      controller: {
        jobs: [],
        creeps: {},
        structures: {},
        constructionSites: {},
      },
    },
    wallRampartHitPercentage: 0.25,
  };
}

export function DefaultStructureMemory(
  manager: ManagerObject
): StructureMemory {
  return { manager, lastExecutedAtTick: 0 };
}

export function DefaultCreepMemory(
  manager: ManagerObject,
  creepType: CreepType
): CreepMemory {
  return { manager, lastExecutedAtTick: 0, creepType };
}
