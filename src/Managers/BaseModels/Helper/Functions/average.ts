export default function AverageValues(value: number, newValue: number): number {
  const newValueMultiplier = 0.001;
  const valueMultiplier = 1 - newValueMultiplier;
  return value * valueMultiplier + newValue * newValueMultiplier;
}
