import BaseManager from "./baseManager";

export default function UpdateMineralManagerCache(room: Room): void {
  const cache = Memory.roomsData.data[room.name].managersMemory.mineral;
  const mineral: Mineral =
    Game.getObjectById(cache.mineral.id) || room.find(FIND_MINERALS)[0];

  if (!mineral || !mineral.room) {
    return;
  }

  if (cache.mineral.id !== mineral.id) {
    cache.mineral = {
      type: mineral.mineralType,
      id: mineral.id,
      amount: mineral.mineralAmount,
      pos: mineral.pos,
    };
  } else {
    cache.mineral.amount = Math.round(mineral.mineralAmount);
  }

  BaseManager(room.name, "mineral");
}
