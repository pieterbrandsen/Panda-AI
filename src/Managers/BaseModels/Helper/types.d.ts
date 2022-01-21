interface JobInitializationData {
    type: JobTypes;
    pos: FreezedRoomPosition;
    executer: string;
    targetId: string;
  
    // ResourceStorage
    fromTargetId?: string;
    amountToTransfer?: number;
  }

  interface StructureInitializationData {
    structure:Structure;
    executer: string;
  }

  interface CreepInitializationData { 
      name:string;
    isRemoteCreep:boolean;
    executer: string;
    body:BodyParts
    pos: FreezedRoomPosition;
    type: CreepTypes;
  }

  interface RoomInitializationData { 
      room:Room;
      remoteRooms?:StringMap<RemoteRoom>;
  }