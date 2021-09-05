import UpdateRoomCache from "./types/rooms";
import UpdateMineralManagerCache from "./types/mineralManager";

export default class CacheManager {
  /**
   * Update the room cache
   */
  public static UpdateRoom = UpdateRoomCache;

  /**
   * Update the mineral manager cache
   * @param room - The room to update
   */
  public static UpdateMineralManager = UpdateMineralManagerCache;
}
