import { forEach } from "lodash";
import IRoomPosition from "../BaseModels/Helper/Room/roomPosition";

interface ISpawnMemory {}

export default class implements ISpawnMemory {
  static SetupMemory(): DroppedResourceManager {
    return {};
  }
}
