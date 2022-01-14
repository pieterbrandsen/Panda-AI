import { forOwn } from "lodash";

interface IExecuteStructures {
    ExecuteStructure(structure:Structure, cache:StructureCache):void;
    ExecuteStructures(structures:StringMap<StructureCache>):void;
}

export default class implements IExecuteStructures {
    ExecuteStructure(structure:Structure, cache:StructureCache):void {
        console.log(structure, cache);
        // TODO: Do job here
    }
    ExecuteStructures(structures:StringMap<StructureCache>):void {
        forOwn(structures, (cache:StructureCache,id:string) => {
            const structure = Game.getObjectById<Structure | null>(id);
            if (structure) {
                this.ExecuteStructure(structure,cache);
            }
            else { 
                console.log(`Structure ${id} not found`);
            }
        })
    }
}
