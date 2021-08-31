import HeapInitializer from "./heap/initialization";
import HeapValidator from "./heap/validation";
import MemoryInitializer from "./memory/initialization";
import MemoryValidator from "./memory/validation";
import { VersionedMemoryTypeName } from "./utils/constants/memory";
import { ErrorMapper } from "./utils/external/errorMapper";

// eslint-disable-next-line
export const loop = ErrorMapper.wrapLoop((): void => {
  if (
    !MemoryValidator.IsMemoryValid(Memory.version, VersionedMemoryTypeName.Root)
  ) {
    MemoryInitializer.SetupRootMemory();
    if (
      !MemoryValidator.IsMemoryValid(
        Memory.version,
        VersionedMemoryTypeName.Root
      )
    )
      return;
  }

  if (!HeapValidator.IsHeapValid()) {
    HeapInitializer.SetupHeap();
    if (!HeapValidator.IsHeapValid()) return;
  }

  console.log(Game.time);
});
