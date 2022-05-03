import StructureData from "../../Managers/BaseModels/Helper/Structure/memory";
import StructureRepair from "./repair";
import StructureHeap from "../../Managers/BaseModels/Heap/structure";
import { StructuresWithRole } from "./constants";
import Jobs from "../../Managers/BaseModels/Jobs/interface";
import JobData from "../../Managers/BaseModels/Helper/Job/memory";
import StructureRoles from "./roles";
import { settings, Mixin, mix } from 'ts-mixer';

settings.decoratorInheritance = "none";

export default class StructureHandler<S extends Structure> extends Mixin(StructureData,StructureRepair,StructureRoles) {
    public structureInformation: StructureInformation<S>;
  
    public IsStructureSetup():boolean {
        if (this.structureInformation.structure && this.structureInformation.cache && this.structureInformation.memory) return true;
        else return false;
    }
    public HasStructureAnJob():boolean {
        if (this.structureInformation.jobCache && this.structureInformation.jobMemory) return true;
        return false;
    }

    constructor(structure: S | null) {   
        super({});
        this.structureInformation = {}; 
        if (!structure) return;
        
        super({structure}   );
        this.structureInformation = {structure}; 
        const structureData = this.GetData();
        if (!structureData.success) return;
        const structureHeapData = this.GetHeap();
        if (!structureHeapData.success) {
            this.InitializeHeap();
        }
        this.ExecuteLink();

        this.structureInformation.cache = structureData.cache;
        this.structureInformation.memory = structureData.memory;
        super(this.structureInformation);
        if (!this.IsStructureSetup() || this.structureInformation.memory!.jobId === undefined) return;

        const structureJobData = JobData.GetMemory(this.structureInformation.memory!.jobId);
        if (!structureJobData.success) return;

        this.structureInformation.jobCache = structureJobData.cache;
        this.structureInformation.jobMemory = structureJobData.memory;
        super(this.structureInformation);
    }

    public Execute(): void {
        if (!this.IsStructureSetup()) {
            
            return;
        }
        this.CreateRepairJobIfNeeded();

        if (this.HasStructureAnJob()) {
            this.ExecuteRole();
        }
    }
    public StructureData = StructureData;
}