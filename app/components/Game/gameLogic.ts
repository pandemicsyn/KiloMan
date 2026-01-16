/**
 * Calculate points based on completion time
 * Point system: Start with 10000 points, lose 100 points per second
 * Minimum 1000 points
 * 
 * @param timeInSeconds - The time taken to complete the level in seconds
 * @returns The calculated points (minimum 1000)
 */
export const calculatePoints = (timeInSeconds: number): number => {
  const basePoints = 10000;
  const pointsPerSecond = 100;
  const points = Math.max(1000, basePoints - Math.floor(timeInSeconds * pointsPerSecond));
  return points;
};
