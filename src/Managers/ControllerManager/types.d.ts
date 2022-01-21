interface ControllerMemory {
  jobId?: string;
  pos: FreezedRoomPosition;
  id: string;
  isOwned: boolean;
}
interface ControllerManager {
  controller?: ControllerMemory;
}
