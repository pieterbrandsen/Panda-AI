/**
 * Remove all construction sites in the room
 * @param room - The room to remove all construction sites from
 */
export default function RemoveAllConstructionSites(room: Room): void {
  room.find(FIND_CONSTRUCTION_SITES).forEach((site) => {
    site.remove();
  });
}
