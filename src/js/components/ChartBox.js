import {seriesTypes, DEFAULT_SCALE, ONE_DAY} from '../config';
import {ChartPreview} from './ChartPreview/ChartPreview';
import {Line} from "../tools/Line";
import {Chart} from "./Chart/Chart";
import {ChartLegend} from "./ChartLegend";
import {roundToMultiplier} from "../utils/math.utils";


export class ChartBox {
  constructor(container, data, title) {
    this.container = container;
    this.title = title;

    this._prepareData(data);
  }

  render() {
    this.draw();

    this.chart.renderData();
    this.preview.renderData();
    this.legend.renderData();
  }

  draw() {
    this._createLayout();
    this._createComponents();
    this._connectChartWithPreview();

    this.container.appendChild(this.el);

    this.resize();

    this.chart.draw();
    this.preview.draw();

  }

  resize() {
    this.chart.setViewBox([this.layout.chart.clientWidth, this.layout.chart.clientHeight]);
    this.preview.setViewBox([this.layout.preview.clientWidth, this.layout.preview.clientHeight]);
  }

  _prepareData({columns, types, names, colors}) {
    this.lines = [];

    let axisCol = columns.find(column => types[column[0]] === seriesTypes.AXIS);

    this.axis = {
      key: axisCol[0],
      values: axisCol.slice(1),
      min: axisCol[1],
      max: axisCol[axisCol.length - 1]
    };

    columns.forEach(column => {
      const [key, ...values] = column;

      if (types[key] === seriesTypes.LINE)
        this.lines.push(new Line(values, {
          key,
          axis: this.axis,
          name: names[key],
          color: colors[key]
        }));
    });
  }

  _createLayout() {
    this.el = document.createElement('div');
    this.el.className = 'chart-box';
    this.el.innerHTML =
      `<h2 class="chart-title">${this.title}</h2>
       <div class="chart-with-preview">
         <div class="chart"></div>
         <div class="chart-preview"></div>
       </div>
       <div class="chart-legend"></div>`;

    const [title, container, legend] = this.el.children;

    this.layout = {
      title,
      legend,
      chart: container.firstElementChild,
      preview: container.lastElementChild
    };
  }

  _createComponents() {
    const initialBounds = this._getInitialBounds();

    this.preview = new ChartPreview(this.layout.preview, this.lines, {
      axis: this.axis,
      initialBounds: initialBounds
    });

    this.chart = new Chart(this.layout.chart, this.lines, {
      axis: this.axis,
      bounds: initialBounds
    });

    this.legend = new ChartLegend(this.layout.legend, this.lines);
  }

  _connectChartWithPreview() {
    this.preview.onUpdateBounds((bounds) => {
      this.chart.setBounds(bounds);
    });

    this.preview.onFinishInteraction(() => {
      this.chart.finishInteraction();
    });
  }

  _getInitialBounds() {
    let lo = this.axis.max - DEFAULT_SCALE * (this.axis.max - this.axis.min);

    return [
      Math.max(this.axis.min, roundToMultiplier(lo, ONE_DAY)),
      this.axis.max
    ];
  }
}
