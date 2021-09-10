import UpdateRoomCache from "./types/rooms";
import UpdateMineralManagerCache from "./types/mineralManager";
import UpdateSpawnManagerCache from "./types/spawnManager";

export default class CacheManager {
  /**
   * Update the rooms cache
   */
  public static UpdateRoom = UpdateRoomCache;

  /**
   * Update the mineral manager cache
   * @param room - The room to update
   */
  public static UpdateMineralManager = UpdateMineralManagerCache;

  /**
   * Update the spawn manager cache
   * @param room - The room to update
   */
  public static UpdateSpawnManager = UpdateSpawnManagerCache;
}
