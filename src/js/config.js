export const seriesTypes = {
  LINE: 'line',
  AXIS: 'x'
};

export const TOUCH_SUPPORT = 'ontouchstart' in window ;

export const Y_SCALE_STEPS = 5;

export const THEMES = ['day', 'night'];

export const CHART_PREVIEW_PADDING = .07;

export const WELCOME_MESSAGE_DELAY = 4000;

export const ONE_DAY = 1000 * 60 * 60 * 24; // in milliseconds

/**
 * Default part of the chart displayed initially
 * @type {number}
 */
export const DEFAULT_SCALE = .25;

export const MIN_DATE_RANGE = 5 * ONE_DAY;

/**
 * Timestamps that differ by less than this constant are considered equal
 * @type {number}
 */
export const TIME_COMPARISON_PRECISION = 1000;

/* EVENTS */

export const lineEvents = {
  TOGGLE: 'toggle'
};

export const linesGroupEvents = {
  UPDATE_Y_RANGE: 'update-y-range',
  UPDATE_X_RANGE: 'update-x-range'
};
