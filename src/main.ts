import { ErrorMapper } from "./Extra/ErrorMapper";
import UpdateGlobalStats from "./Managers/BaseModels/Helper/Stats/updateGlobal";
import RoomsExecuter from "./Executers/Room/interface";
import ResetHeap from "./Managers/BaseModels/Helper/Heap/Reset";
import InitializeSpawnedCreeps from "./Extra/InitializeSpawnedCreepsSpawnedCreeps";
import ShardVision from "./Extra/ShardVision";
import Market from "./Extra/Market";
import GlobalDataHelper from "./Managers/BaseModels/Helper/Global/globalMemory";

// eslint-disable-next-line
export const loop = ErrorMapper.wrapLoop((): void => {
  const globalDataRepo = new GlobalDataHelper();
  if (!globalDataRepo.ValidateSingleHeapData("")) {
    RawMemory.setActiveSegments([1, 98]);
    GlobalDataHelper.InitializeHeapData();
    return;
  }

  if (!GlobalDataHelper.ValidateSingleData()) {
    GlobalDataHelper.InitializeData();
    return;
  }

  RoomsExecuter.ExecuteAllRooms();

  new InitializeSpawnedCreeps().Handle();
  new ShardVision().Handle();
  new Market().HandleOrderEveryTick();

  UpdateGlobalStats();
  ResetHeap.Reset();
  RawMemory.segments[98] = JSON.stringify(Memory.stats);
});
