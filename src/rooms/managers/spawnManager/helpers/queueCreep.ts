/**
 * Force an creep to be queued
 * @param roomName - name of the room to add too
 * @param queuedCreep - The queuedCreep to add
 */
export default function QueueCreep(
  roomName: string,
  queuedCreep: QueueCreep
): void {
  Memory.roomsData.data[roomName].managersMemory.spawn.queue.push(queuedCreep);
}
