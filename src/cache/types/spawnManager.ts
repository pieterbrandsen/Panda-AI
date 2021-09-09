import BaseManager from "./baseManager";

export default function UpdateSpawnManagerCache(room: Room): void {
  BaseManager(room.name, "spawn");
}
