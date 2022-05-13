import JobsHelper from "../../../Managers/BaseModels/Jobs/interface";

export default class CreepTransferRoles<S extends Structure> {
  protected _structureInformation: StructureInformation<S>;

  constructor(structureInformation: StructureInformation<S>) {
    this._structureInformation = structureInformation;
  }

  public ExecuteLink(): JobResult {
    const structure = (this._structureInformation
      .structure as unknown) as StructureLink;
    const target: StructureLink | null = Game.getObjectById(
      this._structureInformation.jobMemory!.targetId
    );
    const from: StructureLink | null = Game.getObjectById(
      this._structureInformation.jobMemory!.fromTargetId ?? ""
    );
    if (from && target) {
      const resource = RESOURCE_ENERGY;
      const amountToTransfer = Math.min(
        target.store.getFreeCapacity(resource),
        structure.store.energy
      );
      if (
        target.store.getUsedCapacity(resource) === 0 ||
        amountToTransfer <= 0
      ) {
        return "done";
      }

      const result = structure.transferEnergy(target, amountToTransfer);
      switch (result) {
        case ERR_FULL:
          return "done";
        case ERR_NOT_ENOUGH_RESOURCES:
          return "empty";
        case OK:
          new JobsHelper().UpdateAmount(
            this._structureInformation.memory!.jobId as string,
            this._structureInformation.jobMemory!,
            this._structureInformation.jobCache!,
            amountToTransfer
          );
          break;
        // skip default case
      }
    }
    return "continue";
  }
}
