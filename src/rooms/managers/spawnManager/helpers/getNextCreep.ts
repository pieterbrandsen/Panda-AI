/**
 * Return an QueueCreep to spawn next
 * @param roomName - name of the room
 */
export default function GetNextCreep(roomName: string): QueueCreep {
  const cache = Memory.roomsData.data[roomName].managersMemory.spawn;
  const { queue } = cache;

  let creep: QueueCreep | undefined;
  while (creep === undefined) {
    switch (cache.lastSpawnedType) {
      case "work":
        cache.lastSpawnedType = "carry";
        break;
      case "carry":
        cache.lastSpawnedType = "work";
        break;
      default:
        cache.lastSpawnedType = "work";
        break;
    }

    creep = queue.find((creep) => creep.creepType === cache.lastSpawnedType);
  }

  return creep;
}
