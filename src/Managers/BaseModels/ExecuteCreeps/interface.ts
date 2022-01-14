import { forOwn } from "lodash";

interface IExecuteCreeps {
    ExecuteCreep(creep:Creep, cache:CreepCache):void;
    ExecuteCreeps(creeps:StringMap<CreepCache>):void
}

export default class implements IExecuteCreeps {
    ExecuteCreep(creep:Creep, cache:CreepCache):void {
        console.log(creep, cache);
        // TODO: Do job here
    }
    ExecuteCreeps(creeps:StringMap<CreepCache>):void {
        forOwn(creeps, (cache:CreepCache,id:string) => {
            const creep = Game.getObjectById<Creep | null>(id);
            if (creep) {
                this.ExecuteCreep(creep,cache);
            }
            else { 
                console.log(`Creep ${id} not found`);
            }
        })
    }
}
