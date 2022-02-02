export default class {
  static HasJobId = (id: string) => {
    return (memory: CreepMemory): boolean => {
      return memory.jobId === id || memory.permJobId === id;
    };
  };
}
