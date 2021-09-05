import { mockGlobal } from "screeps-jest";
import { VersionedMemoryObjects } from "../utils/constants/memory";
import HeapValidator from "./validation";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
});

describe("Memory validation", () => {
  describe("Root", () => {
    it("Should_BeTrue_When_Should_BeMemoryVersionsDoMatch", () => {
      // Act
      const version = 1;
      global.version = version;
      VersionedMemoryObjects.Heap = version;

      // Assert
      expect(HeapValidator.IsHeapValid()).toBeTruthy();
    });
    it("Should_BeFalse_When_MemoryVersionsDon'tMatch", () => {
      // Act
      global.version = 1;
      VersionedMemoryObjects.Heap = 2;

      // Assert
      expect(HeapValidator.IsHeapValid()).toBeFalsy();
    });
    it("Should_BeFalse_When_HeapMemoryVersionsIsUndefined", () => {
      // Act
      global.version = (undefined as unknown) as number;
      VersionedMemoryObjects.Heap = 2;

      // Assert
      expect(HeapValidator.IsHeapValid()).toBeFalsy();
    });
  });
});
