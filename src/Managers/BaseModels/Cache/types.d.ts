interface BaseCache {
  version: number;
}
type CreepCache = BaseCache;
type StructureCache = BaseCache;
type RoomCache = BaseCache;

type CacheObjects = CreepCache | StructureCache | RoomCache;
type CacheTypes = "Creep" | "Structure" | "Room" | "Global";
