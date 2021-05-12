export function equals(a, b, eps = Number.EPSILON) {
  return a <= b + eps && a >= b - eps;
}

export function round(x, decimals = 0) {
  const k = Math.pow(10, decimals);
  return Math.round(x * k) / k;
}

export function roundToMultiplier(x, multiplier) {
  const rem = x % multiplier;
  return x - rem + Math.round(rem / multiplier) * multiplier;
}

export function formatNumber(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function roundToNiceNumber(x) {
  let half = Math.round(x/2);
  let digitsCount = Math.abs(half).toString().length;
  let orderOfHalf = Math.pow(10, digitsCount - 1);

  if (x > 10 * orderOfHalf)
    x = roundToMultiplier(x, orderOfHalf);
  else if (x > 5 * orderOfHalf)
    x = roundToMultiplier(x, .5 * orderOfHalf);
  else if (x > 2 * orderOfHalf)
    x = roundToMultiplier(x, .2 * orderOfHalf);

  return Math.round(x);
}
