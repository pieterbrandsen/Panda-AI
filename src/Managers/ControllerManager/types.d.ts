interface ControllerMemory {
  pos: FreezedRoomPosition;
  id: string;
  isOwned: boolean;
}
interface ControllerManager {
  controller?: ControllerMemory;
}
