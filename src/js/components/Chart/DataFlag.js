import * as DOM from '../../utils/dom.utils';
import {findClosestIndex} from "../../utils/array.utils";
import {formatLong} from "../../utils/date.utils";
import {formatNumber} from "../../utils/math.utils";


export class DataFlag {
  constructor(linesGroup, drawing) {
    this.linesGroup = linesGroup;
    this.flags = {};
    this.drawing = drawing;
  }

  appendTo(container) {
    this.container = container;
  }

  showAt(x, identifier) {
    let i = this._getClosestIndex(x);
    let flag = this.flags[identifier];

    if (!flag)
      this.flags[identifier] = flag = {};

    this._moveFlag(flag, i);
  }

  hide(identifier) {
    let flag = this.flags[identifier];

    if (flag) {
      delete this.flags[identifier];
      flag.layout.line.parentElement.removeChild(flag.layout.line);
      flag.layout.tooltip.parentElement.removeChild(flag.layout.tooltip);
      this.drawing.removePoints(flag.layout.points);
    }
  }

  _getClosestIndex(x) {
    let axisValues = this.linesGroup.axis.values;
    let i2 = findClosestIndex(axisValues, x);
    let i1 = Math.max(0, i2 - 1);

    return Math.abs(axisValues[i1] - x) > Math.abs(axisValues[i2] - x) ? i2 : i1;
  }

  _moveFlag(flag, i) {
    let layout = flag.layout;

    if (!layout)
      layout = this._createFlagLayout();

    if (flag.index !== i) {
      flag.index = i;
      this._updateLayout(layout, flag);
    }

    if (!flag.layout) {
      flag.layout = layout;
      this.container.append(layout.line);
      this.container.append(layout.tooltip);
    }
  }

  _createFlagLayout() {
    let layout = {};

    layout.line = DOM.elementFromString(
      `<div class="data-flag-line"></div>`
    );

    layout.tooltip = DOM.elementFromString(
      `<div class="data-flag-tooltip">
          <div class="tooltip-date"></div>
          <div class="tooltip-points"></div>
        </div>`
    );

    layout.date = layout.tooltip.firstElementChild;
    layout.tooltipDataPoints = layout.tooltip.lastElementChild;
    layout.points = this.drawing.createPointsGroup();

    return layout;
  }

  _updateLayout(layout, flag) {
    let x = this.linesGroup.axis.values[flag.index];
    let leftShift = this._getLeftShiftByX(x) * 100;
    let rightShift = 100 - leftShift;
    let date = formatLong(x);
    let points = this._getPoints(flag.index);

    let pointsLayout = points.map(p =>
      `<div class="tooltip-point" style="color: ${p.color}">
        <div class="p-value">${formatNumber(p.value)}</div>
        <div class="p-name">${p.name}</div>
      </div>`).join('');

    layout.date.innerHTML = date;
    layout.tooltipDataPoints.innerHTML = pointsLayout;
    layout.line.style.left = leftShift + '%';
    layout.tooltip.style.right = rightShift + '%';
    layout.tooltip.style.left = leftShift + '%';
    layout.tooltip.style.transform = `translateX(${-leftShift}%)`;

    this.drawing.drawPointsAtIndex(layout.points, flag.index);
  }

  _getLeftShiftByX(x) {
    return (x - this.linesGroup.minX) / (this.linesGroup.maxX - this.linesGroup.minX);
  }

  _getPoints(i) {
    let p = [];

    this.linesGroup.forEach(line => {
      if (line.enabled)
        p.push({
          name: line.name,
          color: line.color,
          value: line.values[i]
        });
    });

    return p;
  }
}
