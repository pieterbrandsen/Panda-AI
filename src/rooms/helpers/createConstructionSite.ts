import RoomPositionHelper from "./roomPosition";

export default function CreateConstructionSite(
  room: Room,
  pos: RoomPosition,
  structureType: BuildableStructureConstant,
  cache: BaseManagerMemory
): ScreepsReturnCode {
  const result = room.createConstructionSite(pos, structureType);
  const frozenPos = RoomPositionHelper.FreezeRoomPosition(pos);
  switch (result) {
    case OK:
      // TODO: Create job for building structure
      cache.constructionSites[
        RoomPositionHelper.PositionToStringConverter(frozenPos)
      ] = {
        pos: frozenPos,
        type: structureType,
        progressLeft: CONSTRUCTION_COST[structureType],
      };
      break;
    // skip default case
  }

  return result;
}
