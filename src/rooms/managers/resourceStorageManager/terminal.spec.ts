import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../../memory/initialization";
import { DefaultRoomMemory } from "../../../utils/constants/memory";
import TerminalResourceStorageManager from "./terminal";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      map: {
        getRoomLinearDistance: jest
          .fn()
          .mockReturnValueOnce(25)
          .mockReturnValue(1),
      },
      rooms: {},
      creeps: {},
    },
    true
  );
  MemoryInitializer.SetupRootMemory();
});
const terminal = mockInstanceOf<StructureTerminal>({
  id: "structure",
  structureType: STRUCTURE_TERMINAL,
  store: { energy: 1, getCapacity: () => 100 },
  room: { name: "room" },
  send: jest.fn(),
});
const secondTerminal = mockInstanceOf<StructureTerminal>({
  id: "structure2",
  structureType: STRUCTURE_TERMINAL,
  store: { energy: 0, getCapacity: () => 100 },
  room: { name: "secondRoom" },
  send: jest.fn(),
});
const otherTerminal = mockInstanceOf<StructureTerminal>({
  id: "otherStructure",
  structureType: STRUCTURE_TERMINAL,
  store: { energy: 100, getCapacity: () => 100 },
  room: { name: "otherRoom" },
  send: jest.fn(),
});
const otherTerminal2 = mockInstanceOf<StructureTerminal>({
  id: "otherStructure",
  structureType: STRUCTURE_TERMINAL,
  store: { energy: 40, getCapacity: () => 100 },
  room: { name: "otherRoom2" },
  send: jest.fn(),
});
const room = mockInstanceOf<Room>({
  terminal,
  name: "room",
});
const secondRoom = mockInstanceOf<Room>({
  terminal: secondTerminal,
  name: "secondRoom",
});
const otherRoom = mockInstanceOf<Room>({
  terminal: otherTerminal,
  name: "otherRoom",
});
const otherRoom2 = mockInstanceOf<Room>({
  terminal: otherTerminal2,
  name: "otherRoom2",
});

describe("TerminalResourceStorageManager", () => {
  beforeEach(() => {
    Game.rooms = { room, otherRoom, otherRoom2 };
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
    Memory.roomsData.data[otherRoom.name] = DefaultRoomMemory(otherRoom.name);
    Memory.roomsData.data[secondRoom.name] = DefaultRoomMemory(secondRoom.name);
    Memory.roomsData.data[otherRoom2.name] = DefaultRoomMemory(otherRoom2.name);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should_ReturnCallSendOnOtherTerminal_When_EnergyNeededInThisTerminal", () => {
    // Act
    TerminalResourceStorageManager.Execute(terminal);

    // Assert
    expect(otherTerminal.send).toBeCalled();
  });
  it("Should_CallSendOnTerminal_When_EnergyOverflowingInThisOtherTerminal", () => {
    // Act
    TerminalResourceStorageManager.Execute(otherTerminal);

    // Assert
    expect(otherTerminal.send).toBeCalled();
  });
  it("Should_Return_When_TerminalListIsEmpty", () => {
    // Arrange
    Game.rooms = { room };

    // Act
    TerminalResourceStorageManager.Execute(terminal);

    // Assert
    expect(otherTerminal.send).toBeCalled();
  });
  it("Should_CallSendOnOtherTerminal2_When_EnergyIsMissingInTerminal", () => {
    // Act
    Game.rooms = { room };
    TerminalResourceStorageManager.Execute(otherTerminal2);

    // Assert
    expect(otherTerminal2.send).toBeCalled();
  });
  it("Should_CallSendOnOtherTerminal_When_EnergyIsMissingInTerminal", () => {
    // Arrange
    Game.rooms = { room, otherRoom2 };

    // Act
    TerminalResourceStorageManager.Execute(terminal);

    // Assert
    expect(otherTerminal.send).toBeCalled();
  });
  it("Should_CallNoSendFunction_When_BothRoomsAreMissingEnergy", () => {
    // Arrange
    Game.rooms = { room, secondRoom };

    // Act
    TerminalResourceStorageManager.Execute(terminal);

    // Assert
    expect(terminal.send).not.toBeCalled();
    expect(secondTerminal.send).not.toBeCalled();
  });
});
