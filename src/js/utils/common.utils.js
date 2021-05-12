export function debounce(fn, delay) {
  let timeout;

  return function(...args) {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      fn.apply(this, ...args);
    }, delay);
  };
}

export function throttle(fn, delay = 10) {
  let context, args;
  let timeout = null;
  let previous = 0;

  let later = function() {
    previous = 0;
    timeout = null;

    fn.apply(context, args);
    if (!timeout) context = args = null;
  };

  return function() {
    let now = Date.now();
    if (!previous) previous = now;
    let rem = delay - (now - previous);

    context = this;
    args = arguments;

    if (rem <= 0 || rem > delay) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      previous = now;

      fn.apply(context, args);

      if (!timeout) context = args = null;
    } else if (!timeout) {
      timeout = setTimeout(later, rem);
    }
  };
}
