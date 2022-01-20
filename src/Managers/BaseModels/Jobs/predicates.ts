export default class {
  static IsCreepType = (type: CreepTypes) => {
    return (cache: CacheObjects): boolean => {
      return cache.executer === type;
    };
  };
}
