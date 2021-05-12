import {findClosestIndex, getRange} from "../utils/array.utils";
import {Events} from "./Events";
import {lineEvents, linesGroupEvents} from "../config";
import {roundToMultiplier, roundToNiceNumber} from "../utils/math.utils";


export class LinesGroup {
  constructor(lines, options = {}) {
    this.events = new Events();
    this.lines = lines;
    this.padding = options.padding || 0;
    this.nSteps = options.nSteps;

    this.xBounds = options.bounds || [this.lines[0].minX, this.lines[0].maxX];

    this._updateYBounds(true);
    this.forEach(line => line.events.subscribe(lineEvents.TOGGLE, () => {
      this._scaleCache = null;
      this._updateYBounds();
    }));
  }

  get axis() {
    return this.lines[0] && this.lines[0].axis;
  }

  get minX() {
    return this.xBounds[0];
  }

  get maxX() {
    return this.xBounds[1];
  }

  get maxY() {
    return this.yBounds[1];
  }

  get minY() {
    return this.yBounds[0];
  }

  forEach(f) {
    this.lines.forEach(f);
  }

  /**
   * Limit displayed parts of the lines from left and right
   * @param {Bounds} bounds
   */
  setHorizontalBounds(bounds) {
    this.xBounds = bounds;
    this._latestAxisIndices = null; // invalidate cache
    this._updateYBounds();
    this.events.next(linesGroupEvents.UPDATE_X_RANGE);
  }

  /**
   * @param {ViewBox} viewBox
   * @returns {TransformationMatrix}
   */
  getHorizontalTransform(viewBox) {
    const globalMinX = this.lines[0].minX,
          linesScaleX = this.lines[0].transformationMatrix[0];

    let scaleX = viewBox[0] / (this.maxX - this.minX) / linesScaleX;
    let translateX = viewBox[0] * (this.minX - globalMinX) / (this.maxX - this.minX) * -1;

    return [scaleX, 0, 0, 1, translateX, 0];
  }

  /**
   * @param {ViewBox} viewBox
   * @param {Line|string} line or key
   * @returns {TransformationMatrix}
   */
  getVerticalTransformForLine(viewBox, line) {
    let scaleY = viewBox[1] / (this.maxY - this.minY) * (line.maxY - line.minY) / line.viewBox[1];
    // translation formulas are different for X and Y because transform origin defaults to `top, left`,
    // which corresponds to maximum Y and minimum X (thus using `minX` but `maxY`);
    // translateX is multiplied by `-1` to ensure lines are translated to the left
    let translateY = viewBox[1] * (this.maxY - line.maxY) / (this.maxY - this.minY);

    return [1, 0, 0, scaleY, 0, translateY];
  }

  finishInteraction() {
    this._scaleCache = null;
    this._updateYBounds();
  }

  _getYBounds() {
    let values = [];
    const [i1, i2] = this._getAxisIndicesRange();

    this.lines.forEach(line => {
      if (line.enabled) {
        let range = line.getMinMaxWithinIndices(i1, i2);
        values.push(range[0], range[1]);
      }
    });

    return getRange(values) || [];
  }

  _getAxisIndicesRange() {
    const axis = this.axis.values;

    if (!this._latestAxisIndices)
      this._latestAxisIndices = [
        findClosestIndex(axis, this.minX) - 1,
        findClosestIndex(axis, this.maxX)
      ];

    return this._latestAxisIndices;
  }

  _updateYBounds(silent) {
    let oldBounds = this.yBounds;
    let bounds = this._getYBounds();

    if (!oldBounds)
      oldBounds = bounds;

    if (this.padding) {
      bounds[1] += this.padding * (bounds[1] - bounds[0]);
      bounds[0] -= this.padding * (bounds[1] - bounds[0]);
    }

    if (this.nSteps)
      bounds = this._adjustBoundsToScale(bounds);

    this.yBounds = bounds;

    if (!silent && oldBounds[0] !== this.yBounds[0] || oldBounds[1] !== this.yBounds[1])
      this.events.next(linesGroupEvents.UPDATE_Y_RANGE);
  }

  _adjustBoundsToScale([min, max]) {
    const allowedBottomPadding = 0.6;
    const allowedTopPadding = 0.3;
    const reservedTopPadding = .15;


    let diff = max - min;
    let step = diff / this.nSteps;

    let cache = this._scaleCache;

    if (cache &&
        cache[0] > min - step * allowedBottomPadding &&
        cache[1] > max && cache[1] < max + allowedTopPadding * step) {
      return cache;
    }

    let scaleMin = Math.max(0, min - step * allowedBottomPadding);
    let scaleMax = max + step * reservedTopPadding;

    scaleMin = roundToNiceNumber(scaleMin);

    this._scaleCache = [scaleMin, scaleMax];

    return [scaleMin, scaleMax];
  }
}
