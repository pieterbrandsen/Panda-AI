
// IsStructureType
export default <S extends StructureConstant, T extends ConcreteStructure<S>>(structureType: S) => {
  return (structure: AnyStructure): structure is T => {
      return structure.structureType === structureType;
  };
};