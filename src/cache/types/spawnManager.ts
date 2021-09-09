import { forOwn } from "lodash";
import RoomPositionHelper from "../../rooms/helpers/roomPosition";
import IsStructureType from "../../utils/constants/predicate";
import BaseManager from "./baseManager";

export default function UpdateSpawnManagerCache(room: Room): void {
  BaseManager(room.name, "spawn")
}
