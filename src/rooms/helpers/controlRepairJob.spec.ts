import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializer from "../../memory/initialization";
import { DefaultRoomMemory } from "../../utils/constants/memory";
import ControlRepairJob from "./controlRepairJob";

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>("Game", { rooms: {}, structures: {}, creeps: {} }, true);
  MemoryInitializer.SetupRootMemory();
});
const room = mockInstanceOf<Room>({
  name: "W0N1",
});

const damagedRampart = mockInstanceOf<Structure>({
  hits: 0,
  hitsMax: 300 * 1000 * 1000,
  structureType: "rampart",
  id: "structure",
  pos: { x: 0, y: 0, roomName: room.name },
});
const damagedStructure = mockInstanceOf<Structure>({
  hits: 0,
  hitsMax: 100,
  structureType: "extension",
  id: "structure",
  pos: { x: 0, y: 0, roomName: room.name },
});
const nonDamagedStructure = mockInstanceOf<Structure>({
  hits: 100,
  hitsMax: 100,
  structureType: "extension",
  id: "structure",
});

describe("ControlRepairJob", () => {
  beforeEach(() => {
    Memory.roomsData.data[room.name] = DefaultRoomMemory(room.name);
  });
  it("Should_CreateNoJob_When_NotDamaged", () => {
    // Arrange
    const spawnCache = Memory.roomsData.data[room.name].managersMemory.spawn;

    // Act
    ControlRepairJob.ControlDamagedStructure(nonDamagedStructure, {
      name: "spawn",
      roomName: room.name,
    });

    // Assert
    expect(spawnCache.jobs.length).toBe(0);
  });
  it("Should_OnlyCreate1JobToFullFillRepairing_When_NoJobWasFound", () => {
    // Arrange
    const spawnCache = Memory.roomsData.data[room.name].managersMemory.spawn;

    // Act
    ControlRepairJob.ControlDamagedStructure(damagedStructure, {
      name: "spawn",
      roomName: room.name,
    });
    ControlRepairJob.ControlDamagedStructure(damagedStructure, {
      name: "spawn",
      roomName: room.name,
    });

    // Assert
    expect(spawnCache.jobs.length).toBe(1);
  });
  it("Should_CreateAnSmallRepairJob_When_RampartIsBelow5KHitPoints", () => {
    // Arrange
    const spawnCache = Memory.roomsData.data[room.name].managersMemory.spawn;
    damagedRampart.hits = 0;

    // Act
    ControlRepairJob.ControlDamagedStructure(damagedRampart, {
      name: "spawn",
      roomName: room.name,
    });

    // Assert
    expect(spawnCache.jobs[0].amountLeft).toBe(5000);
  });
  it("Should_IncreaseRequiredPercentageByMax0.5PercentWhenAbove5K", () => {
    // Arrange
    const spawnCache = Memory.roomsData.data[room.name].managersMemory.spawn;
    damagedRampart.hits = 50000;

    // Act
    ControlRepairJob.ControlDamagedStructure(damagedRampart, {
      name: "spawn",
      roomName: room.name,
    });

    // Assert
    expect(spawnCache.jobs[0].requiredPercentage).toBe(0.25);
  });
});
