import * as SVG from "../utils/svg.utils";
import {lineEvents, linesGroupEvents, TOUCH_SUPPORT} from "../config";


export class Drawing {
  constructor(viewBox, options = {}) {
    this.viewBox = viewBox;
    this.onHover = options.onHover;
    this.onHoverEnd = options.onHoverEnd;

    this.svgContainer = SVG.elementFromString(
      `<svg viewBox="0 0 ${viewBox[0]} ${viewBox[1]}" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <g></g>
      </svg>`
    );
    this.linesContainer = this.svgContainer.firstElementChild;
    this._pointRadius = this._getPreferredPointRadius();
  }

  resize(viewBox) {
    this.viewBox = viewBox;
    this.svgContainer.setAttribute('viewBox', `0 0 ${viewBox[0]} ${viewBox[1]}`);
    this._updateTransformations();
    this._pointRadius = this._getPreferredPointRadius();
  }

  appendTo(el) {
    el.appendChild(this.svgContainer);
  }

  drawLinesGroup(linesGroup) {
    this.linesGroup = linesGroup;
    this.svgLines = {};

    this.linesGroup.forEach(line => {
      this.svgLines[line.key] = SVG.createPolyline(line.svgPoints, line.color);
      line.events.subscribe(lineEvents.TOGGLE, this._onToggleLine, this);
    });

    this._updateTransformations();

    for (let key in this.svgLines)
      this.linesContainer.appendChild(this.svgLines[key]);

    this.linesGroup.events.subscribe(linesGroupEvents.UPDATE_Y_RANGE, this._transformVertically, this);
    this.linesGroup.events.subscribe(linesGroupEvents.UPDATE_X_RANGE, this._transformHorizontally, this);

    if (this.onHover)
      this._trackHoverEvents();
  }

  createPointsGroup() {
    let points = [];

    this.linesGroup.forEach(line => {
      if (line.enabled) {
        let circle = SVG.elementFromString(
          `<circle r="${this._pointRadius}" class="data-point" stroke="${line.color}"/>`
        );
        this.svgContainer.appendChild(circle);
        points.push(circle);
      }
    });

    return points;
  }

  drawPointsAtIndex(pointsGroup, index) {
    let i = 0;
    this.linesGroup.forEach(line => {
      if (line.enabled) {
        let circle = pointsGroup[i];
        let xy = this._getCoordinatesByIndex(line, index);

        circle.setAttribute('cx', xy[0]);
        circle.setAttribute('cy', xy[1]);
        i++;
      }
    });
  }

  removePoints(pointsGroup) {
    pointsGroup.forEach(p => {
      this.svgContainer.removeChild(p);
    });
  }

  _updateTransformations() {
    this._transformVertically();
    this._transformHorizontally();
  }

  _transformVertically() {
    this.linesGroup.forEach(line => {
      let svgLine = this.svgLines[line.key];
      let matrix = this.linesGroup.getVerticalTransformForLine(this.viewBox, line);

      SVG.applyTransformationMatrix(svgLine, matrix);
    });
  }

  _transformHorizontally() {
    let matrix = this.linesGroup.getHorizontalTransform(this.viewBox);
    SVG.applyTransformationMatrix(this.linesContainer, matrix);
  }

  _onToggleLine(line) {
    let polyline = this.svgLines[line.key];
    polyline.classList.toggle('disabled');
  }

  _getCoordinatesByIndex(line, i) {
    let xValue = line.axis.values[i];
    let yValue = line.values[i];

    return [
      (xValue - this.linesGroup.minX) / (this.linesGroup.maxX - this.linesGroup.minX) * this.viewBox[0],
      this.viewBox[1] - (yValue - this.linesGroup.minY) / (this.linesGroup.maxY - this.linesGroup.minY) * this.viewBox[1]
    ];
  }

  _trackHoverEvents() {
    let bounds;
    let registeredTouches = {};

    let onTouchStart = (e) => {
      bounds = this.svgContainer.getBoundingClientRect();

      if (Object.keys(registeredTouches).length === 0) {
        document.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
        document.addEventListener('touchend', onTouchEnd);
      }

      for (let touch of e.changedTouches) {
        registeredTouches[touch.identifier] = true;

        this.onHover(
          touch.identifier,
          this._getXByFraction((touch.clientX - bounds.left) / bounds.width)
        );
      }
    };

    let onTouchMove = (e) => {
      for (let touch of e.changedTouches) {
        if (registeredTouches[touch.identifier]) { // only if touch began at svgContainer target
          this.onHover(
            touch.identifier,
            this._getXByFraction((touch.clientX - bounds.left) / bounds.width)
          );
        }
      }

      if (Object.keys(registeredTouches).length > 1)
        e.preventDefault();
    };

    let onMouseMove = (e) => {
      bounds = bounds || this.svgContainer.getBoundingClientRect();

      this.onHover(
        'mouse',
        this._getXByFraction((e.clientX - bounds.left) / bounds.width)
      );
    };

    let onTouchEnd = (e) => {
      for (let touch of e.changedTouches) {
        if (registeredTouches[touch.identifier]) {
          delete registeredTouches[touch.identifier];
          this.onHoverEnd(touch.identifier);
        }
      }

      if (Object.keys(registeredTouches).length === 0) {
        document.removeEventListener('touchmove', onTouchMove, { capture: true });
        document.removeEventListener('touchend', onTouchEnd);
      }
    };

    if (TOUCH_SUPPORT)
      this.svgContainer.addEventListener('touchstart', onTouchStart);
    else {
      this.svgContainer.addEventListener('mousemove', onMouseMove);
      this.svgContainer.addEventListener('mouseleave', () => {
        bounds = null;
        this.onHoverEnd('mouse');
      });
    }
  }

  _getXByFraction(fraction) {
    return this.linesGroup.minX + fraction * (this.linesGroup.maxX - this.linesGroup.minX);
  }

  _getPreferredPointRadius() {
    let width = this.viewBox[0];
    let r = 3.5;

    if (width > 500)
      r = 4;

    if (width > 800)
      r = 4.5;

    if (width > 1100)
      r = 5.5;

    return r;
  }
}
