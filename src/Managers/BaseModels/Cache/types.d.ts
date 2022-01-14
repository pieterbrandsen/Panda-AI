/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
interface BaseCache {
  version: number;
}
interface CreepCache extends BaseCache {

}
interface StructureCache extends BaseCache {
  type:StructureConstant;

}
interface RoomCache extends BaseCache {

}

type CacheObjects = CreepCache | StructureCache | RoomCache;
type CacheTypes = "Creep" | "Structure" | "Room" | "Global";
type CacheStructurePredicateNames = "IsStructureType";
