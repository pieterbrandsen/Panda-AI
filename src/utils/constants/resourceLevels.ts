const ResourceLevels: ResourceLevels = {
  containerNormal: { empty: 50, full: 80 },
  containerSource: {
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
  linkNormal: {
    empty: 50,
    full: 50,
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
};
export default ResourceLevels;
