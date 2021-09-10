/**
 * Kill all creeps in the room
 * @param room - The room to kill all creeps from
 */
export default function KillAllCreeps(room: Room): void {
  room.find(FIND_MY_CREEPS).forEach((creep) => {
    creep.suicide();
  });
}
