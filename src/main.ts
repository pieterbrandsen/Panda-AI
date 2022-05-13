import { ErrorMapper } from "./Extra/ErrorMapper";
import GlobalMemory from "./Managers/BaseModels/Memory/global";
import GlobalData from "./Managers/BaseModels/Helper/Global/globalMemory";
import UpdateGlobalStats from "./Managers/BaseModels/Helper/Stats/updateGlobal";
import RoomsExecuter from "./Executers/Room/interface";
import ResetHeap from "./Managers/BaseModels/Helper/Heap/Reset";
import HeapMemory from "./Managers/BaseModels/Heap/global";
import InitializeSpawnedCreeps from "./Extra/InitializeSpawnedCreepsSpawnedCreeps";
import ShardVision from "./Extra/ShardVision";
import Market from "./Extra/Market";

// eslint-disable-next-line
export const loop = ErrorMapper.wrapLoop((): void => {
  const globalData = new GlobalData();
  if (!globalData.HeapDataRepository.ValidateSingleData()) {
    RawMemory.setActiveSegments([1, 98]);
    globalData.InitializeHeap();
    return;
  }

  if (!globalData.ValidateSingleData()) {
    globalData.InitializeData();
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
