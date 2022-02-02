import { ErrorMapper } from "./tempErrorMapper";
import IGlobalMemory from "./Managers/BaseModels/Memory/globalInterface";
import IGlobalData from "./Managers/BaseModels/Helper/Global/globalMemory";
import IRoomsExecuter from "./Executers/Room/interface";

// eslint-disable-next-line
export const loop = ErrorMapper.wrapLoop((): void => {
  // const orders = Game.market.getAllOrders(order => order.resourceType == CPU_UNLOCK &&
  //   order.type == ORDER_BUY &&
  //   order.price > 40 * 1000 * 1000);
  
  // for(let i=0; i<orders.length; i++) {
  //   const order = orders[i];
  //   const result = Game.market.deal(order.id, 100);
  //   if (result == OK) {
  //     const message = `Dealed ${order.amount} for ${order.price}`;
  //     Game.notify(message,0);
  //     console.log(message);      
  //   }
  // }

  if (!IGlobalMemory.ValidateSingle()) {
    IGlobalData.Initialize();
    return;
  }
  IRoomsExecuter.ExecuteAllRooms();
});
