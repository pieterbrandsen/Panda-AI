export default class  {
    static IsCreepType = (type: CreepTypes) => {
        return (cache: CacheObjects) => {
            return cache.executer === type;
        };
    };
}