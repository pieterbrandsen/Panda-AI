/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
interface JobMemory extends BaseMemory {
    type:JobTypes;
    pos:FreezedRoomPosition;
    lastAssigned:number;
}

type JobTypes = "HarvestSource"|"TransferSpawn";