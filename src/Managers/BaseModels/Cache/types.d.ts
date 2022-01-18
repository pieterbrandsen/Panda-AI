/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
interface BaseCache {
  version: number;
  executer:string;
}
interface CreepCache extends BaseCache {
  pos:FreezedRoomPosition
}
interface StructureCache extends BaseCache {
  type:StructureConstant;
  pos:FreezedRoomPosition
}
interface RoomCache extends BaseCache {

}
interface JobCache extends BaseCache {
}

type CacheObjects = CreepCache | StructureCache | RoomCache | JobCache;
type CacheTypes = "Creep" | "Structure" | "Room" | "Job";
type CacheStructurePredicateNames = "IsStructureType";
