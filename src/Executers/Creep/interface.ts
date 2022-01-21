import { forOwn } from "lodash";

interface ICreepExecuter {}

export default class implements ICreepExecuter {
  static ExecuteCreep(creep: Creep, cache: CreepCache): void {
    console.log(creep, cache);
  }

  static ExecuterAllCreeps(creeps: StringMap<CreepCache>): void {
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
