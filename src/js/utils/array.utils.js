/**
 * Get {min, max} range of the array of numeric values, within the given indices (including edges), if provided
 * @param {Array<number>} values
 * @param {Bounds?} bounds
 * @returns {Bounds}
 */
export function getRange(values, bounds) {
  if (values.length > 0) {
    let min = Infinity;
    let max = -Infinity;
    let n = bounds ? Math.min(bounds[1], values.length - 1) : values.length - 1;

    for (let i = bounds ? bounds[0] : 0; i <= n; i++) {
      if (values[i] < min)
        min = values[i];

      if (values[i] > max)
        max = values[i];
    }

    return [min, max];
  }
}

/**
 * Find index of the array element matching the given number or being closest larger number,
 * using binary search algorithm and assuming the array is sorted ascendingly
 * @param {Array<number>} values
 * @param {number} x
 * @returns {number}
 */
export function findClosestIndex(values, x) {
  let m = 0;
  let n = values.length - 1;

  while (m <= n) {
    let k = (n + m) >> 1;

    if (x > values[k])
      m = k + 1;
    else if(x < values[k])
      n = k - 1;
    else
      return k;
  }

  return m;
}
