import JobTypeExecuter from "./JobTypeExecuter";

export default class PioneerCreep {
  public static Execute(creep: Creep, creepMem: CreepMemory, job: Job): void {
    JobTypeExecuter.Execute(creep, creepMem, job);
  }
}
