import HeapInitializer from "./heap/initialization";
import HeapValidator from "./heap/validation";
import GarbageCollection from "./memory/garbageCollection";
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

  GarbageCollection.Check();
  if (global.heapLifeTime === undefined) {
    Memory.heapLifeTimes.push(Memory.lastHeapLifeTime);
    global.heapLifeTime = 0;
  }
  global.heapLifeTime += 1;
  Memory.lastHeapLifeTime = global.heapLifeTime;
  console.log(Memory.lastHeapLifeTime);
});
