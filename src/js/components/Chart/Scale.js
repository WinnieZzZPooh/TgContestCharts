import * as DOM from '../../utils/dom.utils';
import {linesGroupEvents} from "../../config";
import {debounce} from "../../utils/common.utils";
import {formatNumber, roundToMultiplier, roundToNiceNumber} from "../../utils/math.utils";


export class Scale {
  constructor(linesGroup) {
    this.linesGroup = linesGroup;
    this.linesGroup.events.subscribe(linesGroupEvents.UPDATE_Y_RANGE, debounce(this.render, 100), this);
  }

  appendTo(container) {
    this.el = DOM.elementFromString(`<div class="y-scale"></div>`);
    container.appendChild(this.el);
  }

  render() {
    let oldGrid = this.grid;
    this.grid = this._createGrid();

    this._showGrid(this.grid);

    this.min = this.linesGroup.minY;
    this.max = this.linesGroup.maxY;

    if (oldGrid)
      this._removeGrid(oldGrid);
  }

  _createGrid() {
    let min = this.linesGroup.minY,
        max = this.linesGroup.maxY;
    let html = '';
    let nRows = this.linesGroup.nSteps;
    let step = (max - min) / (nRows + 0.5);

    step = roundToNiceNumber(step);

    for (let i = min; i < max; i += step)
      html += `<div class="grid-line ${i === min ? 'edge' : ''}" style="bottom: ${(i - min) / (max - min) * 100}%">
          ${this._formatLabel(i, max, min)}
        </div>`;

    return {
      min: min,
      max: max,
      el: DOM.elementFromString(`<div class="grid ${!this.grid ? 'normal-grid' : ''}">${html}</div>`) // add 'normal-grid' when created first time
    };
  }

  _showGrid(grid) {
    this._updateStyles(grid);
    this.el.appendChild(grid.el);

    setTimeout(() => {
      grid.el.classList.add('normal-grid');
    }, 50);
  }

  _removeGrid(grid) {
    this._updateStyles(grid, .3);
    grid.el.classList.remove('normal-grid');

    grid.el.addEventListener('transitionend', () => {
      this.el.removeChild(grid.el);
    }, { once: true });
  }

  _updateStyles(grid, opacity = 0) {
    let existingDiff = this.max - this.min;
    let gridDiff = grid.max - grid.min;

    grid.el.style.bottom = (grid.min - this.min) / gridDiff * 100 + '%';
    grid.el.style.height = gridDiff / existingDiff * 100 + '%';
    grid.el.style.opacity = opacity;
  }

  _formatLabel(x, max, min) {
    let mid = (max + min) / 2;

    if (max > 1e6)
      return (x / 1e6).toFixed(mid < 1e7 ? 2 : (mid < 5e7 ? 1 : 0)) + 'M';
    else if (max > 1e3)
      return (x / 1e3).toFixed(mid < 1e4 ? 2 : (mid < 5e4 ? 1 : 0)) + 'K';
    else
      return x.toString();
  }
}
