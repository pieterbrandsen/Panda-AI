/**
 * Freeze an position so its lighter to the memory
 * @param pos - the position to freeze
 * @returns- the frozen position object
 */
export default function FreezeRoomPosition(
  pos: RoomPosition
): FreezedRoomPosition {
  return { x: pos.x, y: pos.y, roomName: pos.roomName };
}

/**
 * Unfreeze a position from the memory
 * @param pos - the position to unfreeze
 * @returns - the live position object
 */
export function UnfreezeRoomPosition(pos: FreezedRoomPosition): RoomPosition {
  return new RoomPosition(pos.x, pos.y, pos.roomName);
}

/**
 * Convert an position to an simple string
 * @param pos - the position to converter
 * @returns
 */
export function PositionToStringConverter(
  pos: FreezedRoomPosition | RoomPosition
): string {
  return `${pos.x}-${pos.y}-${pos.roomName}`;
}
