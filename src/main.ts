import { ErrorMapper } from "./Extra/ErrorMapper";
import GlobalMemory from "./Managers/BaseModels/Memory/global";
import GlobalData from "./Managers/BaseModels/Helper/Global/globalMemory";
import UpdateGlobalStats from "./Managers/BaseModels/Helper/Stats/updateGlobal";
import RoomsExecuter from "./Executers/Room/interface";
import ResetHeap from "./Managers/BaseModels/Helper/Heap/Reset";
import HeapMemory from "./Managers/BaseModels/Heap/global";
import InitializeSpawnedCreeps from "./Extra/InitalizeSpawnedCreeps";
import HandleAllShardActions from "./Extra/HandleAllShardActions";
import Market from "./Extra/Market";

// eslint-disable-next-line
export const loop = ErrorMapper.wrapLoop((): void => {
  if (!HeapMemory.ValidateSingle()) {
    RawMemory.setActiveSegments([1, 98]);
    HeapMemory.Initialize();
    return;
  }

  if (!GlobalMemory.ValidateSingle()) {
    GlobalData.Initialize();
    return;
  }

  RoomsExecuter.ExecuteAllRooms();

  InitializeSpawnedCreeps();
  HandleAllShardActions();
  new Market().HandleEveryTickOrders();

  UpdateGlobalStats();
  ResetHeap.Reset();
  RawMemory.segments[98] = JSON.stringify(Memory.stats);
});
