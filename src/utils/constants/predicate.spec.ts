import { mockInstanceOf } from "screeps-jest";
import IsStructureType, { GetRepairAmount } from "./predicate";

const inputStructure = IsStructureType("container");
const container = mockInstanceOf<StructureContainer>({
  structureType: "container",
});
const link = mockInstanceOf<StructureLink>({ structureType: "link" });

describe("Predicate", () => {
  it("Should_ReturnTrueWithContainer_WhenFuncIsLookingForContainer", () => {
    // Act
    const result = inputStructure(container);

    // Assert
    expect(result).toBe(true);
  });
  it("Should_ReturnFalseWithLink_WhenFuncIsLookingForContainer", () => {
    // Act
    const result = inputStructure(link);

    // Assert
    expect(result).toBe(false);
  });
  it("Should_ReturnZero_When_NoRepairingIsNeeded", () => {
    // Act
    const amountLeft = GetRepairAmount(10, 5, 100);

    // Assert
    expect(amountLeft).toBe(5);
  });
});
