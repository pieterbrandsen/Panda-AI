import IRoomHelper from "../Helper/roomInterface";

export default class {
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
      return IRoomHelper.GetRoom(cache.executer).key === roomName;
    };
  };

  static IsInRoomNameArray = (roomNames: string[]) => {
    return (cache: CacheObjects): boolean => {
      return roomNames.includes(IRoomHelper.GetRoom(cache.executer).key);
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
}
