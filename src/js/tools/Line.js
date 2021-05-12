import {getRange} from "../utils/array.utils";
import * as SVG from '../utils/svg.utils';
import {Events} from "./Events";
import {lineEvents} from "../config";


export class Line {
  /**
   * @param {Array<number>} values
   * @param {{
   *  name: string,
   *  key: string,
   *  color: string,
   *  axis: Axis,
   *  enabled?: boolean
   * }} options
   */
  constructor(values, options) {
    this.events = new Events();
    this.values = values;
    this.key = options.key;
    this.axis = options.axis;
    this.name = options.name;
    this.color = options.color;
    this.enabled = options.enabled || true;
    this._cachedMinMax = {};

    let range = getRange(values);
    this.minX = this.axis.values[0];
    this.maxX = this.axis.values[this.axis.values.length - 1];
    this.minY = range[0];
    this.maxY = range[1];
    this.viewBox = [10000, 1000];

    const scaleX = this.viewBox[0] / (this.maxX - this.minX);
    const scaleY = this.viewBox[1] / (this.maxY - this.minY);

    this.transformationMatrix = [
      scaleX, 0,
      0, scaleY,
      0, 0
    ];

    this.svgPoints = SVG.toPolylinePoints(
      this._normalizeToViewBox(),
      this.viewBox
    );
  }

  toggle() {
    this.enabled = !this.enabled;
    this.events.next(lineEvents.TOGGLE, this);
  }

  getMinMaxWithinIndices(i1, i2) {
    const key = `${i1}:${i2}`;

    if (this._cachedMinMax.key !== key) {
      // remember the latest result
      this._cachedMinMax.key = key;
      this._cachedMinMax.range = getRange(this.values, [i1, i2]);
    }

    return this._cachedMinMax.range;
  }

  /**
   * Normalize points of the line so that they are relative to the line's view box
   * @returns {Array<Point>}
   */
  _normalizeToViewBox() {
    const [width, height] = this.viewBox;
    const xValues = this.axis.values,
      y = this.values;
    const minX = this.minX,
      maxX = this.maxX,
      minY = this.minY,
      maxY = this.maxY;
    const dX = maxX - minX,
      dY = maxY - minY;

    return xValues.map((x, i) => [
      (x - minX)/dX * width,
      (y[i] - minY)/dY * height
    ]);
  }
}
