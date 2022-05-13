interface JobInitializationData {
  type: JobTypes;
  pos: FreezedRoomPosition;
  executer: string;
  targetId: string;
  objectType: JobObjectExecuter;
  maxCreepsCount?: number;

  // ResourceStorage
  fromTargetId?: string;
  amountToTransfer?: number;

  // Build
  structureType?: StructureConstant;
}

interface StructureInitializationData {
  structure: Structure;
  executer: string;
  isSource?: boolean;
}

interface DroppedResourceInitializationData {
  resource: Resource;
  executer: string;
}

interface CreepInitializationData {
  id: string;
  name: string;
  isRemoteCreep: boolean;
  executer: string;
  body: BodyParts;
  pos: FreezedRoomPosition;
  type: CreepTypes;
}

interface RoomInitializationData {
  room: Room;
  remoteRooms?: StringMap<RemoteRoom>;
}

interface GlobalInitializationData {}
