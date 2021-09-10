import {
  VersionedMemoryObjects,
  VersionedMemoryTypeName,
} from "../utils/constants/memory";

export default class HeapInitializer {
  /**
   * Sets all heap vars to default values.
   */
  private static InitializeHeap(): void {
    global.totalQueuedCreeps = 0;
    global.version = VersionedMemoryObjects[VersionedMemoryTypeName.Heap];
  }

  /**
   * Initializes the heap to an usable state.
   */
  public static SetupHeap(): void {
    HeapInitializer.InitializeHeap();
  }
}
