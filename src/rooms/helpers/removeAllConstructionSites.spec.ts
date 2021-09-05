import { mockGlobal, mockInstanceOf } from "screeps-jest";
import RemoveAllConstructionSites from "./removeAllConstructionSites";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", {}, true);
});

const constructionSite = mockInstanceOf<ConstructionSite>({
  remove: jest.fn(),
});

const room = mockInstanceOf<Room>({
  name: "W0N1",
  find: jest.fn().mockReturnValue([constructionSite]),
});

describe("KillAllCreeps", () => {
  it("Should_KillAllCreepsInRoom_When_Called", () => {
    // Act
    RemoveAllConstructionSites(room);

    // Assert
    expect(constructionSite.remove).toBeCalled();
  });
});
