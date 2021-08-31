import MemoryInitializer from "./memory/initialization";
import MemoryValidator from "./memory/validation";
import { VersionedMemoryTypeName } from "./utils/constants/memory";
import { ErrorMapper } from "./utils/external/errorMapper";

// eslint-disable-next-line
export const loop = ErrorMapper.wrapLoop((): void => {
  if (!MemoryValidator.IsMemoryValid(2, VersionedMemoryTypeName.Root))
    MemoryInitializer.SetupRootMemory();
});
