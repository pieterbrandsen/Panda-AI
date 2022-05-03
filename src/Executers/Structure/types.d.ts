interface StructureInformation<S extends Structure> { 
    structure?: S;
    memory?: StructureMemory;
    cache?: StructureCache;
    jobCache?: JobCache;
    jobMemory?: JobMemory;
}