/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
interface JobMemory extends BaseMemory {
    pos:FreezedRoomPosition;
    lastAssigned:number;
    targetId:string;
    
    fromTargetId?:string;
    amountToTransfer?:number;
}
interface JobInitializationData {
    type: JobTypes;
    pos: FreezedRoomPosition;
    executer:string;
    targetId:string;
    
    // ResourceStorage
    fromTargetId?:string;
    amountToTransfer?:number;
}

type JobTypes = "HarvestSource"|"TransferSpawn" | "TransferStructure";