import { mockGlobal } from "screeps-jest";
import VersionedMemoryObjects, {
  VersionedMemoryTypeName,
} from "../utils/constants/memory";
import MemoryValidator from "./validation";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
});

describe("Memory validation", () => {
  describe("Root", () => {
    it("Should_BeTrue_When_Should_BeMemoryVersionsDoMatch", () => {
      // Act
      VersionedMemoryObjects.Root = 1;

      // Assert
      expect(
        MemoryValidator.IsMemoryValid(1, VersionedMemoryTypeName.Root)
      ).toBeTruthy();
    });
    it("Should_BeFalse_When_MemoryVersionsDon'tMatch", () => {
      // Act
      VersionedMemoryObjects.Root = 2;

      // Assert
      expect(
        MemoryValidator.IsMemoryValid(1, VersionedMemoryTypeName.Root)
      ).toBeFalsy();
    });
  });
});
