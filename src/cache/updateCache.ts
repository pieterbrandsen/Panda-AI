import UpdateRoomCache from "./types/rooms";
import UpdateMineralManagerCache from "./types/mineralManager";
import UpdateSpawnManagerCache from "./types/spawnManager";
import UpdateSourceManagerCache from "./types/sourceManager";
import UpdateControllerManagerCache from "./types/controllerManager";
import UpdatePioneerManagerCache from "./types/pioneerManager";

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
   * Update the source manager cache
   * @param room - The room to update
   */
  public static UpdateSourceManager = UpdateSourceManagerCache;

  /**
   * Update the spawn manager cache
   * @param room - The room to update
   */
   public static UpdateSpawnManager = UpdateSpawnManagerCache;
   public static UpdateControllerManager = UpdateControllerManagerCache;
   public static UpdatePioneerManager = UpdatePioneerManagerCache;
  }
