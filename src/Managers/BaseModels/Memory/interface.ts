//* Types of cache: Creep, Room, Global, Jobs
//* For each are the following functions
// TODO: Validate
// TODO: Create object
// TODO: Get (from path)
// TODO: Add (to path)
// TODO: Update (to path)
// TODO: Delete (with option for garbage collection) (to path)

import { forEach } from "lodash";

export interface IMemory {
    Validate(data:StringMap<MemoryObjects>,type:MemoryTypes): {isValid:boolean,nonValidMemoryObjects:string[]}
    MinimumMemoryVersion(type:MemoryTypes):number;
}

export default abstract class implements IMemory {
    MinimumMemoryVersion(type: MemoryTypes): number {
        switch (type) {
            case "Creep":
                return Memory.CreepsData.version;
            case "Structure":
                return Memory.StructuresData.version;
            case "Room":
                return Memory.RoomsData.version;
            default:
                return 999;
        }
    }
    Validate(data: StringMap<MemoryObjects>,type:MemoryTypes) {
        const minimumVersion = this.MinimumMemoryVersion(type);
        let isValid = true;
        const nonValidMemoryObjects:string[] = [];
        forEach(data, (value,key) => {
            if (value.version < minimumVersion) {
                isValid = false;
                nonValidMemoryObjects.push(key);
            }
        });

        return {isValid,nonValidMemoryObjects};
    }

}
