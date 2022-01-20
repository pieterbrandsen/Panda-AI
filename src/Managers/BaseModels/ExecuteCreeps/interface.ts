import { forOwn } from "lodash";

interface IExecuteCreeps {}

export default class implements IExecuteCreeps {
  static ExecuteCreep(creep: Creep, cache: CreepCache): void {
    console.log(creep, cache);
    // TODO: Do job here
  }

  static ExecuteCreeps(creeps: StringMap<CreepCache>): void {
    forOwn(creeps, (cache: CreepCache, id: string) => {
      const creep = Game.getObjectById<Creep | null>(id);
      if (creep) {
        this.ExecuteCreep(creep, cache);
      } else {
        console.log(`Creep ${id} not found`);
      }
    });
  }
}
