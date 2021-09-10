import { mockGlobal, mockInstanceOf } from "screeps-jest";
import IsMyRoom from "./isMyRoom";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
});

const myController = mockInstanceOf<StructureController>({ my: true });
const notMyController = mockInstanceOf<StructureController>({ my: false });

describe("IsMyRoom", () => {
  it("Should_ReturnTrue_When_ControllerIsMine", () => {
    // Act
    const result = IsMyRoom(myController);

    // Assert
    expect(result).toBe(true);
  });
  it("Should_ReturnFalse_When_ControllerIsNotMine", () => {
    // Act
    const result = IsMyRoom(undefined);

    // Assert
    expect(result).toBe(false);
  });
  it("Should_ReturnFalse_When_ControllerIsUndefined", () => {
    // Act
    const result = IsMyRoom(notMyController);

    // Assert
    expect(result).toBe(false);
  });
});
