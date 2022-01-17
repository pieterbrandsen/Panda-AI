export default class  {
    /**
     * Checks if inputted structureType is equal to structure's structureType
     */
     static IsStructureType = <T extends StructureConstant, S extends StructureCache>(structureType: T) => {
        return (structureCache: StructureCache): structureCache is S => {
            return structureCache.type === structureType;
        };
    };
    static IsExecuter = (executer?: string) => {
        return (cache: CacheObjects) => {
            return cache.executer === "" || cache.executer === undefined || cache.executer === executer;
        };
    };
    static IsStructureTypes = (structureTypes:StructureConstant[],shouldBe:boolean) => {
        return (cache: StructureCache) => {
            return structureTypes.includes(cache.type) === shouldBe;
        };
    };
}