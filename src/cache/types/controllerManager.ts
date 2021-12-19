import { forEach, forOwn } from "lodash";
import BaseManager from "./baseManager";

export default function UpdateControllerManagerCache(room: Room): void {
  const cache = Memory.roomsData.data[room.name].managersMemory.controller;

  BaseManager(room.name, "controller");
}
