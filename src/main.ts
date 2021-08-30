import MemoryValidator from "./memory/validation";
import { ErrorMapper } from "./utils/external/errorMapper";

// eslint-disable-next-line
export const loop = ErrorMapper.wrapLoop((): void => {
  MemoryValidator.IsMemoryValid(2, "Creep");
});
