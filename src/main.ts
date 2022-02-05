import { ErrorMapper } from "./Extra/ErrorMapper";
import IGlobalMemory from "./Managers/BaseModels/Memory/globalInterface";
import IGlobalData from "./Managers/BaseModels/Helper/Global/globalMemory";
import IRoomsExecuter from "./Executers/Room/interface";
import IResetHeap from "./Managers/BaseModels/Helper/Heap/Reset";
import IHeapMemory from "./Managers/BaseModels/Heap/globalInterface";
import InitializeSpawnedCreeps from "./Extra/InitalizeSpawnedCreeps";
import HandleAllShardActions from "./Extra/HandleAllShardActions";

// eslint-disable-next-line
export const loop = ErrorMapper.wrapLoop((): void => {
  if (Game.shard.name === "shard0") {
    let orders = Game.market.getAllOrders(
      (order) =>
        order.resourceType === CPU_UNLOCK &&
        order.type === ORDER_BUY &&
        order.price > 37 * 1000 * 1000
    );

    for (let i = 0; i < orders.length; i += 1) {
      const order = orders[i];
      const result = Game.market.deal(order.id, 100);
      if (result === OK) {
        const message = `Dealed CPU UNLOCK ${order.amount} for ${order.price}`;
        Game.notify(message, 0);
        console.log(message);
      }
    }

    orders = Game.market.getAllOrders(
      (order) =>
        order.resourceType === PIXEL &&
        order.type === ORDER_SELL &&
        order.price < 10 * 1000
    );

    for (let i = 0; i < orders.length; i += 1) {
      const order = orders[i];
      const result = Game.market.deal(order.id, 10000);
      if (result === OK) {
        const message = `Dealed PIXEL ${order.amount} for ${order.price}`;
        Game.notify(message, 0);
        console.log(message);
      }
    }
  }

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
  Memory.stats.resources = {
    CPU_UNLOCK: Game.resources[CPU_UNLOCK],
    PIXEL: Game.resources[PIXEL],
    ACCESS_KEY: Game.resources[ACCESS_KEY],
  };
  if (Game.time % 2500 === 0) {
    Game.notify(JSON.stringify(Memory.stats.resources), 0);
  }

  IResetHeap.Reset();
  RawMemory.segments[98] = JSON.stringify(Memory.stats);
});
