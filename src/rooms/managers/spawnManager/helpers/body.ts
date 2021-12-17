import { forEach } from "lodash";
import {
  DefaultIteratee,
  LoopIteratee,
} from "../../../../utils/constants/body";

export default class BodyHelper {
  /**
   * Return the total cost of the body
   * @param body - The body to calculate the cost of
   * @returns - Cost of body
   */
  public static GetBodyCost(body: BodyPartConstant[]): number {
    let cost = 0;
    forEach(body, (part: BodyPartConstant) => {
      cost += BODYPART_COST[part];
    });
    return cost;
  }

  /**
   * Return an array of body part arrays to add to queue
   * @param room - The room to generate bodies from
   * @param requiredBodyPartCount - The number of body parts required
   * @param jobType - Job of creep
   * @returns - An array of body part arrays
   */
  public static Generate(
    room: Room,
    requiredBodyPartCount: number,
    jobType: JobType
  ): BodyPartConstant[][] {
    const arrayOfBodyParts: BodyPartConstant[][] = [];
    let i = 0;
    let y = 0;
    let currentCost = 0;

    const maxCost =
      room.energyCapacityAvailable / 2 > 300
        ? room.energyCapacityAvailable / 2
        : 300;
    const defaultIteratee = DefaultIteratee[jobType];
    const loopIteratee = LoopIteratee[jobType];

    console.log(
      jobType,
      JSON.stringify(defaultIteratee),
      JSON.stringify(loopIteratee)
    );
    arrayOfBodyParts[y] = defaultIteratee.body;
    currentCost = defaultIteratee.cost;
    i = defaultIteratee.reqBodyPartPerLoop;
    while (i < requiredBodyPartCount) {
      if (
        currentCost + loopIteratee.cost > maxCost ||
        arrayOfBodyParts[y].length + loopIteratee.body.length > 50
      ) {
        if (i === 0) break;
        y += 1;
        arrayOfBodyParts[y] = defaultIteratee.body;
        currentCost = defaultIteratee.cost;
        i += defaultIteratee.reqBodyPartPerLoop;
      } else {
        i += loopIteratee.reqBodyPartPerLoop;
        arrayOfBodyParts[y] = arrayOfBodyParts[y].concat(loopIteratee.body);
        currentCost += loopIteratee.cost;
      }
    }
    return arrayOfBodyParts;
  }
}
