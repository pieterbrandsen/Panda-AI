import { ErrorMapper } from "./Extra/ErrorMapper";
import IGlobalMemory from "./Managers/BaseModels/Memory/globalInterface";
import IGlobalData from "./Managers/BaseModels/Helper/Global/globalMemory";
import UpdateGlobalStats from "./Managers/BaseModels/Helper/Stats/updateGlobal";
import IRoomsExecuter from "./Executers/Room/interface";
import IResetHeap from "./Managers/BaseModels/Helper/Heap/Reset";
import IHeapMemory from "./Managers/BaseModels/Heap/globalInterface";
import InitializeSpawnedCreeps from "./Extra/InitalizeSpawnedCreeps";
import HandleAllShardActions from "./Extra/HandleAllShardActions";
import BuyOrders from "./Extra/BuyOrders";

// eslint-disable-next-line
export const loop = ErrorMapper.wrapLoop((): void => {
  if (!IHeapMemory.ValidateSingle()) {
    RawMemory.setActiveSegments([1, 98]);
    IHeapMemory.Initialize();
    return;
  }

  if (!IGlobalMemory.ValidateSingle()) {
    IGlobalData.Initialize();
    return;
  }

  IRoomsExecuter.ExecuteAllRooms();

  InitializeSpawnedCreeps();
  HandleAllShardActions();
  BuyOrders();

  UpdateGlobalStats();
  IResetHeap.Reset();
  RawMemory.segments[98] = JSON.stringify(Memory.stats);
});