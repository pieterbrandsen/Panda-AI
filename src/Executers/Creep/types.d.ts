interface CreepInformation {
  id: string;
  creep: Creep | null;
  memory?: CreepMemory;
  cache?: CreepCache;
  jobCache?: JobCache;
  jobMemory?: JobMemory;
}
