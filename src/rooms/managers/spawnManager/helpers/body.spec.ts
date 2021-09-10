import { mockInstanceOf } from "screeps-jest";
import BodyHelper from "./body";
import { DefaultIteratee, LoopIteratee } from "../../../../utils/constants/body";

const room = mockInstanceOf<Room>({
  name: "room",
});

describe("BodyHelper", () => {
  it("Should_CalculateTheCorrectCosts_WhenCalledWithBody", () => {
    // Assert
    expect(BodyHelper.GetBodyCost([WORK, WORK])).toBe(200);
    expect(BodyHelper.GetBodyCost([WORK, CARRY])).toBe(150);
    expect(BodyHelper.GetBodyCost([WORK, CLAIM])).toBe(700);
    expect(BodyHelper.GetBodyCost([])).toBe(0);
  });
  it("Should_Generate2BodiesOf1Loop_When_1BodyIsHalfEnergyCap", () => {
    // Arrange
    room.energyCapacityAvailable = 300;

    // Act
    const bodies = BodyHelper.Generate(room, 2, "harvestMineral");

    // Assert
    expect(bodies).toHaveLength(2);
    expect(bodies[0]).toHaveLength(3);
    expect(bodies[1]).toHaveLength(3);
  });
  it("Should_ReturnEmptyBody_When_EnergyLevelIsTooLowToQueue1Loop", () => {
    // Arrange
    room.energyCapacityAvailable = 602;
    DefaultIteratee.pioneer.cost = 200;

    // Act
    const bodies = BodyHelper.Generate(room, 1, "pioneer");

    // Assert
    expect(bodies[0]).toHaveLength(0);
  });
  it("Should_NotCreateBodyOver50Parts_When_Called", () => {
        // Arrange
        room.energyCapacityAvailable = 30000;
        LoopIteratee.pioneer = {body: [WORK], cost: 1, reqBodyPartPerLoop: 1};
    
        // Act
        const bodies = BodyHelper.Generate(room, 51, "pioneer");
    
        // Assert
        expect(bodies[0]).toHaveLength(50);
  })
});
