export default class MemoryPredicates {
  static HasJobId = (id: string) => {
    return (memory: CreepMemory): boolean => {
      return memory.jobId === id || memory.permJobId === id;
    };
  };
}
