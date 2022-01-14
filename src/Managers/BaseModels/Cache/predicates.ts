export default class  {
    /**
     * Checks if inputted structureType is equal to structure's structureType
     */
     static IsStructureType = <T extends StructureConstant, S extends StructureCache>(structureType: T) => {
        return (structureCache: StructureCache): structureCache is S => {
            return structureCache.type === structureType;
        };
    };
}