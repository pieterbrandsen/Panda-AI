import { forEach } from "lodash";
import { ErrorMapper } from "./tempErrorMapper";
import IGlobalMemory from "./Managers/BaseModels/Memory/globalInterface";
import IGlobalData from "./Managers/BaseModels/Helper/Global/globalMemory";
import IRoomsExecuter from "./Executers/Room/interface";
import ICreepData from "./Managers/BaseModels/Helper/Creep/creepMemory";

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

  forEach(Memory.updateCreepNames, (name, index) => {
    const creep = Game.creeps[name];
    const memoryData = ICreepData.GetMemory(name);
    if (creep && creep.id && memoryData.success) {
      let result = true;
      result = ICreepData.CreateMemory(
        creep.id,
        memoryData.memory as CreepMemory,
        memoryData.cache as CreepCache
      ).success;
      if (result) result = ICreepData.DeleteMemory(name, true, true).success;
      if (result) Memory.updateCreepNames.splice(index, 1);
    } else if (!creep) {
      Memory.updateCreepNames.splice(index, 1);
    }
  });
});
