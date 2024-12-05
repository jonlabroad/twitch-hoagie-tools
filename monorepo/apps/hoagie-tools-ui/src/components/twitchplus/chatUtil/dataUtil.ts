export const linearExtrapolate = (x: number[], y: number[], extrapolatedX: number) => {
  const [x1, x2] = x;
  const [y1, y2] = y;

  const slope = (y2 - y1) / (x2 - x1);
  return y1 + slope * (extrapolatedX - x1);
};
