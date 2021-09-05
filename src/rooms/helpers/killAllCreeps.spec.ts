import { mockGlobal, mockInstanceOf } from "screeps-jest";
import KillAllCreeps from "./killAllCreeps";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
});

const creep = mockInstanceOf<Creep>({ suicide: jest.fn() });

const room = mockInstanceOf<Room>({
  name: "W0N1",
  find: jest.fn().mockReturnValue([creep]),
});

describe("KillAllCreeps", () => {
  it("Should_KillAllCreepsInRoom_When_Called", () => {
    // Act
    KillAllCreeps(room);

    // Assert
    expect(creep.suicide).toBeCalled();
  });
});
