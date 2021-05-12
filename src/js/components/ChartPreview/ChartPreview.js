import {LinesGroup} from "../../tools/LinesGroup";
import {Slider} from "./Slider";
import {Drawing} from "../../tools/Drawing";
import {CHART_PREVIEW_PADDING, MIN_DATE_RANGE} from "../../config";
import {throttle} from "../../utils/common.utils";


export class ChartPreview {
  constructor(element, lines, options) {
    this.el = element;
    this.axis = options.axis;
    this.initialBounds = options.initialBounds;
    this.linesGroup = new LinesGroup(lines, {
      padding: CHART_PREVIEW_PADDING
    });

    this._updateScaleDefferred = throttle(this._updateScale, 10);
  }

  setViewBox([width, height]) {
    this.viewBox = [width, height];

    if (this.drawing)
      this.drawing.resize(this.viewBox);
  }

  draw() {
    this.drawing = new Drawing(this.viewBox);
    this.drawing.appendTo(this.el);

    this.slider = new Slider(this.el, {
      minScaleWidth: MIN_DATE_RANGE / (this.axis.max - this.axis.min),
      onChange: (scale) => {
        this._updateScaleDefferred(scale);
      },
      onFinish: () => {
        this.onFinishInteractionCallback();
      }
    });
  }

  renderData() {
    this.drawing.drawLinesGroup(this.linesGroup);
    this.slider.setScale(
      this._getScaleByBounds(this.initialBounds)
    );
  }

  onUpdateBounds(cb) {
    this.onUpdateBoundsCallback = cb;
  }

  onFinishInteraction(cb) {
    this.onFinishInteractionCallback = cb;
  }

  _updateScale(scale) {
    this.onUpdateBoundsCallback(this._getBoundsByScale(scale))
  }

  _getBoundsByScale(scale) {
    return [
      this.axis.min + scale[0] * (this.axis.max - this.axis.min),
      this.axis.min + scale[1] * (this.axis.max - this.axis.min)
    ];
  }

  _getScaleByBounds(bounds) {
    return [
      (bounds[0] - this.axis.min) / (this.axis.max - this.axis.min),
      (bounds[1] - this.axis.min) / (this.axis.max - this.axis.min)
    ];
  }
}
