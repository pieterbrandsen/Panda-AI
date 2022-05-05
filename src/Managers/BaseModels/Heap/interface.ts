//* Types of cache: Creep, Room, Global, Jobs
//* For each are the following functions
// TODO: Create object
// TODO: CRUD

export default class HeapData {
  protected ValidateSingleHeap(id: string, type: HeapTypes): boolean {
    switch (type) {
      case "Creep":
        return global.CreepsData[id] !== undefined;
      case "Structure":
        return global.StructuresData[id] !== undefined;
      case "Room":
        return global.RoomsData[id] !== undefined;
      case "Global":
        return global.Version !== undefined;
      default:
        return false;
    }
  }
}
