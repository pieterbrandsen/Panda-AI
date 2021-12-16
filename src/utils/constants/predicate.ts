/**
 * Get amount of hits required to be repaired
 * @param requiredPercentage - Amount required to be minimum repair amount
 * @param hits - Number of hits
 * @param hitsMax - Max number of hits
 */
export function GetRepairAmount(
  requiredPercentage: number,
  hits: number,
  hitsMax: number
): number {
  const valueOf1Percentage = hitsMax / 100;
  const usedPercentage = (hits / hitsMax) * 100;
  const requiredHits = Math.round(
    (requiredPercentage - usedPercentage) * valueOf1Percentage
  );
  return requiredHits;
}

// IsStructureType
export default <S extends StructureConstant, T extends ConcreteStructure<S>>(
  structureType: S
) => {
  return (structure: AnyStructure): structure is T => {
    return structure.structureType === structureType;
  };
};
