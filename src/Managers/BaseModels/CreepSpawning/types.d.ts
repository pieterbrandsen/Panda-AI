type CreepTypes = "miner" | "worker" | "transferer";
interface SpawningObject {
  type: CreepTypes;
  name: string;
  body: BodyPartConstant[];
}
interface BodyCost {
  cost: number;
  body: BodyPartConstant[];
  reqBodyPartPerLoop: number;
  maxLoopCount: number;
}
interface BodyCostRoomTypes {
  default: BodyCost;
  loop: BodyCost;
}

type BodyParts = StringMapGeneric<number, BodyPartConstant>;

interface CreepBodyIteratee {
  remote?: BodyCostRoomTypes;
  owned?: BodyCostRoomTypes;
}
