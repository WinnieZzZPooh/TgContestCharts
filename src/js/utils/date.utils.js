const year = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/**
 * Format given date or timestamp with default configuration
 * @param {number|string|Date} timestampOrDate
 * @returns {string}
 */
export function format(timestampOrDate) {
  let date = new Date(timestampOrDate);
  return `${year[date.getMonth()]} ${date.getDate()}`;
}

export function formatLong(timestampOrDate) {
  let date = new Date(timestampOrDate);
  return `${week[date.getDay()]} ${year[date.getMonth()]} ${date.getDate()}`;
}
