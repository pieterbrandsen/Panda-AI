import { forOwn } from "lodash";
import CacheManager from "../../../cache/updateCache";
import ExecuteCreep from "../../../creep/executeCreep";
import ExecuteStructure from "../../../structures/executeStructure";
import CreateConstructionSite from "../../helpers/createConstructionSite";
import EnergyStructurePositioningHelper from "../../helpers/getBestEnergyStructureSpot";
import RoomPositionHelper from "../../helpers/roomPosition";
import JobCreatorHelper from "../../jobs/creation";
import JobUpdater from "../../jobs/update";
import UpdateSpawningQueue from "../spawnManager/update";

export default class PioneerManager {
  /**
   * Execute the mineral manager
   * @param room  - The room
   */
  public static Run(room: Room): void {
    const cache = Memory.roomsData.data[room.name].managersMemory.pioneer;

    JobUpdater.Run(cache.jobs);

    CacheManager.UpdatePioneerManager(room);

    forOwn(cache.creeps, (cacheCrp, key) => {
    ExecuteCreep.Execute(cacheCrp, key, "pioneer");
    });
    forOwn(cache.structures, (cacheStr, key) => {
      ExecuteStructure.Execute(cacheStr, key, "pioneer");
    });

    UpdateSpawningQueue.Update(room, "upgrade", "pioneer");
    UpdateSpawningQueue.Update(room, "build", "pioneer");
    UpdateSpawningQueue.Update(room, "repair", "pioneer");
    UpdateSpawningQueue.Update(room, "harvestSource", "pioneer");
    UpdateSpawningQueue.Update(room, "transferSpawning", "pioneer");
  }
}
