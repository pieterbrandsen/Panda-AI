/**
 * Check if room is my room based on if controller is defined or .my returned false
 * @param room - The room to check
 * @returns - IsMyRoom
 */
export default function IsMyRoom(controller?: StructureController): boolean {
  return !!(controller && controller.my);
}
