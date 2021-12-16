export default class LinkStructure {
  public static Execute(link: StructureLink, managerName: ManagerNames): void {
    switch (managerName) {
      case "source": {
        const cachedBaseLink =
          Memory.roomsData.data[link.room.name].managersMemory.base.link;
        const baseLink = Game.getObjectById<StructureLink | null>(
          cachedBaseLink ? cachedBaseLink.id : ""
        );
        if (baseLink) {
          link.transferEnergy(baseLink, link.store.energy / 2);
        }
        break;
      }
      case "base": {
        const cachedControllerLink =
          Memory.roomsData.data[link.room.name].managersMemory.controller
            .energyStructure;
        const controllerLink = Game.getObjectById<StructureLink | null>(
          cachedControllerLink ? cachedControllerLink.id : ""
        );
        if (controllerLink) {
          link.transferEnergy(controllerLink, link.store.energy / 2);
        }
        break;
      }
      // skip default case
    }
  }
}
