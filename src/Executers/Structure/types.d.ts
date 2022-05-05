interface StructureInformation<S extends Structure> {
  id: string;
  structure: S | null;
  memory?: StructureMemory;
  cache?: StructureCache;
  jobCache?: JobCache;
  jobMemory?: JobMemory;
}
