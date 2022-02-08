interface ControllerMemory {
  pos: FreezedRoomPosition;
  id: string;
  isOwned: boolean;
  structureId?: string;
  structureBuildJobId?: string;
  structureType?: BuildableStructureConstant;
}
interface ControllerManager {
  controller?: ControllerMemory;
}
