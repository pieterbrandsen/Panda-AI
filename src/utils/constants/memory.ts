/* eslint-disable no-shadow */
/*
  Object with VersionedMemoryName
*/
export default {
  Heap: 0,
  Root: 0,
  Room: 0,
  Creep: 0,
  Structure: 0,
} as VersionedMemory;

export enum VersionedMemoryTypeName {
  "Heap" = "Heap",
  "Root" = "Root",
  "Room" = "Room",
  "Structure" = "Structure",
  "Creep" = "Creep",
}
