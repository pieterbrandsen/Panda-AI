import RoomHelper from "../Helper/Room/interface";

export default class CachePredicates {
  /**
   * Checks if inputted structureType is equal to structure's structureType
   */
  static IsStructureType = <
    T extends StructureConstant,
    S extends StructureCache
  >(
    structureType: T
  ) => {
    return (structureCache: StructureCache): structureCache is S => {
      return structureCache.type === structureType;
    };
  };

  static IsExecuter = (executer?: string) => {
    return (cache: CacheObjects): boolean => {
      return (
        cache.executer === "" ||
        cache.executer === undefined ||
        cache.executer === executer
      );
    };
  };

  static IsRoomName = (roomName: string) => {
    return (cache: CacheObjects): boolean => {
      return RoomHelper.GetRoomName(cache.executer) === roomName;
    };
  };

  static IsInRoomNameArray = (roomNames: string[]) => {
    return (cache: CacheObjects): boolean => {
      return roomNames.includes(RoomHelper.GetRoomName(cache.executer));
    };
  };

  static IsStructureTypes = (
    structureTypes: StructureConstant[],
    shouldBe: boolean
  ) => {
    return (cache: StructureCache): boolean => {
      return structureTypes.includes(cache.type) === shouldBe;
    };
  };

  static IsInRangeOf(pos: RoomPosition, range: number) {
    return (cache: StructureCache | DroppedResourceCache): boolean => {
      return pos.getRangeTo(cache.pos.x, cache.pos.y) <= range;
    };
  }
}
