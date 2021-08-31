import { mockGlobal } from "screeps-jest";
import VersionedMemoryObjects, {
  VersionedMemoryTypeName,
} from "../utils/constants/memory";
import HeapInitializer from "./initialization";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
});

describe("HeapInitialization", () => {
  it("Should_SetupHeap_When_Called", () => {
    // Act
    HeapInitializer.SetupHeap();

    // Assert
    expect(global.version).toBe(
      VersionedMemoryObjects[VersionedMemoryTypeName.Root]
    );
  });
});
