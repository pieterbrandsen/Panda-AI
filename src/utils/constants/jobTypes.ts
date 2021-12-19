const harvestJobTypes: JobType[] = [
    "harvestSource",
]
const workJobTypes: JobType[] = [
  "harvestMineral",
  "repair",
  "upgrade",
  "build",
];
const carryGetJobType: JobType = "withdraw";
const carrySetJobType: JobType = "transfer";
const pioneerGetJobTypes: JobType[] = ["harvestSource", "withdraw"];
const pioneerSetJobTypes: JobType[] = workJobTypes.concat(["transferSpawning"]);
export {
  workJobTypes,
  carryGetJobType,
  carrySetJobType,
  pioneerGetJobTypes,
  pioneerSetJobTypes,
  harvestJobTypes
};
