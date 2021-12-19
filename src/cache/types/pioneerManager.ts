import { forEach, forOwn } from "lodash";
import BaseManager from "./baseManager";

export default function UpdatePioneerManagerCache(room: Room): void {
  const managers = Memory.roomsData.data[room.name].managersMemory;
  const cache = Memory.roomsData.data[room.name].managersMemory.pioneer;

  cache.jobs = [];
  cache.constructionSites = {};
  forOwn(managers, (manager, name) => {
    if (name !== "pioneer") {
      cache.jobs = cache.jobs.concat(manager.jobs);
      cache.constructionSites = {...manager.constructionSites, ...cache.constructionSites }
    }
  })

  BaseManager(room.name, "pioneer");
}
