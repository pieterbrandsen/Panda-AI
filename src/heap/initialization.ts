import ConstantMemoryVersions,{ VersionedMemoryTypeName } from "../utils/constants/memory";

export default class HeapInitializer {
  /**
   * Sets all heap vars to default values.
   */
    private static InitializeHeap(): void {
      global.version = ConstantMemoryVersions[VersionedMemoryTypeName.Heap]
    };

    /**
     * Initializes the heap to an usable state.
     */
    public static SetupHeap(): void {
      HeapInitializer.InitializeHeap();
    }
}