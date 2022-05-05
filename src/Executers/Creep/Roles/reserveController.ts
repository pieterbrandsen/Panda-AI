export default class CreepReserveControllerRole {
  protected _creepInformation: CreepInformation;

  constructor(creepInformation: CreepInformation) {
    this._creepInformation = creepInformation;
  }

  ExecuteReserveControllerRole(): JobResult {
    const creep = this._creepInformation.creep!;
    const target = Game.getObjectById(
      this._creepInformation.jobMemory!.targetId
    ) as StructureController | null;
    if (target) {
      const result = creep.reserveController(target);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target);
          break;
        case OK:
          break;
        // skip default case
      }
    }

    return "continue";
  }
}
