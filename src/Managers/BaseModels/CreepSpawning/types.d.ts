interface SpawningObject {
    type:CreepTypes;
    name: string;
    body: BodyPartConstant[];
    executer: string;
}
interface BodyCost  {
    cost:number;
    body:BodyPartConstant[];
    reqBodyPartPerLoop: number,
    maxLoopCount: number;
}

type CreepTypes = "miner" | "worker" | "transferer";
type BodyParts = StringMapGeneric<number,BodyPartConstant>;