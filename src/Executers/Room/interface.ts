import { forEach, union } from "lodash";
import RoomData from "../../Managers/BaseModels/Helper/Room/memory";
import SetupRoom from "../../Managers/BaseModels/Helper/Room/setup";
import RoomHandler from "./room";

export default class RoomExecuter {
  static ExecuteAllRooms(): boolean {
    const roomsCache = RoomData.GetAllDataBasedOnCache("", false);
    const roomNamesWithVision = Object.keys(Game.rooms);
    forEach(roomNamesWithVision, (roomName) => {
      const room = Game.rooms[roomName];
      if (room && !roomsCache[roomName]) {
        new SetupRoom(room).Initialize();
      }
    });

    const roomNames = Object.keys(roomsCache);
    forEach(union(roomNames, roomNamesWithVision), (roomName) => {
      new RoomHandler(
        roomName,
        roomNamesWithVision.includes(roomName)
      ).Execute();
    });
    return true;
  }
}
