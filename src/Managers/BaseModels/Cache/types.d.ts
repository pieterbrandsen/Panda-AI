/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
interface BaseCache {
  version: number;
  executer: string;
}
interface CreepCache extends BaseCache {
  pos: FreezedRoomPosition;
  body: BodyParts;
  type: CreepTypes;
  remoteOrigin?: string;
}
interface StructureCache extends BaseCache {
  type: StructureConstant;
  pos: FreezedRoomPosition;
}
interface DroppedResourceCache extends BaseCache {
  type: ResourceConstant;
  pos: FreezedRoomPosition;
}
interface RoomCache extends BaseCache {}
interface JobCache extends BaseCache {
  type: JobTypes;
}

type CacheObjects = DroppedResourceCache | CreepCache | StructureCache | RoomCache | JobCache;
type CacheTypes = "DroppedResource" | "Creep" | "Structure" | "Room" | "Job";
type CacheStructurePredicateNames = "IsStructureType";
