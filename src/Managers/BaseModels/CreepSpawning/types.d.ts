type CreepTypes = "miner" | "worker" | "transferer";
interface SpawningObject {
  type: CreepTypes;
  name: string;
  body: BodyPartConstant[];
  executer: string;
}
interface BodyCost {
  cost: number;
  body: BodyPartConstant[];
  reqBodyPartPerLoop: number;
  maxLoopCount: number;
}

type BodyParts = StringMapGeneric<number, BodyPartConstant>;
