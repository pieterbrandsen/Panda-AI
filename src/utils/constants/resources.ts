export const ResourceLevels: {energy: EnergyResourceLevels, default: DefaultResourceLevels} = {
  energy: {containerSource: {
    empty: 0,
    full: 0,
  },
  containerController: {
    empty: 0,
    full: 80,
  },
  extension: {
    empty: 0,
    full: 100,
  },
  linkController: {
    empty: 0,
    full: 100,
  },
  linkHearth: {
    empty: 30,
    full: 60,
  },
  linkSource: {
    empty: 100,
    full: 0,
  },
  spawn: {
    empty: 0,
    full: 100,
  },
  storage: {
    empty: 10,
    full: 30,
  },
  terminal: {
    empty: 25,
    full: 50,
  },
  tower: {
    empty: 0,
    full: 100,
  },
},
default: { 
    mineral: {
        empty: 2,
        full: 3,
    },
    compounds: {
        empty: 1,
        full: 1,
    },
    factory: {
        empty: 0,
        full: 1,
    }
}
};

export const MineralResources: ResourceConstant[] = [
    RESOURCE_POWER,
    RESOURCE_HYDROGEN,
    RESOURCE_OXYGEN,
    RESOURCE_UTRIUM,
    RESOURCE_KEANIUM,
    RESOURCE_LEMERGIUM,
    RESOURCE_ZYNTHIUM,
    RESOURCE_CATALYST,
]
export const BoostResources: ResourceConstant[] = [
    RESOURCE_CATALYZED_GHODIUM_ACID
]
export const FactoryResources: ResourceConstant[] = [
    RESOURCE_MACHINE
]
