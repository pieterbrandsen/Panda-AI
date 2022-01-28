import { ErrorMapper } from "./tempErrorMapper";
import IGlobalMemory from "./Managers/BaseModels/Memory/globalInterface";
import IGlobalData from "./Managers/BaseModels/Helper/Global/globalMemory";
import IRoomsExecuter from "./Executers/Room/interface";

// eslint-disable-next-line
export const loop = ErrorMapper.wrapLoop((): void => {
  if (!IGlobalMemory.ValidateSingle()) {
    IGlobalData.Initialize();
    return;
  }
  IRoomsExecuter.ExecuteAllRooms();
});
