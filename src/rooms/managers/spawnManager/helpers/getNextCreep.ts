/**
 * Return an QueueCreep to spawn next
 * @param roomName - name of the room
 */
export default function GetNextCreep(roomName: string,isPioneerCreep:boolean): QueueCreep |undefined {
  const cache = Memory.roomsData.data[roomName].managersMemory.spawn;
  const queue = !isPioneerCreep ? cache.queue :  cache.queue.filter((crp) => crp.managerName === "pioneer");

  let creep: QueueCreep | undefined;
  const checkQueueForType = (creepType:CreepType):void => {
    creep = queue.find((crp) => crp.creepType === creepType);
  }

    switch (cache.lastSpawnedType) {
      case "work":
        if (cache.lastSpawnedType === "work") break;
        checkQueueForType("carry");
        break;
      case "carry":
        if (cache.lastSpawnedType === "carry") break;
        checkQueueForType("harvest");
        break;
        case "harvest":
        if (cache.lastSpawnedType === "harvest") break;
        checkQueueForType("work");
          break;
          // skip default case
    }

  return creep;
}
