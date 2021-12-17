import JobTypeExecuter from "./JobTypeExecuter";

export default class TransfererCreep {
  public static Execute(creep: Creep, creepMem: CreepMemory, job: Job): void {
    JobTypeExecuter.Execute(creep, creepMem, job);
  }
}
