import {LinesGroup} from "../../tools/LinesGroup";
import {TIME_COMPARISON_PRECISION, Y_SCALE_STEPS} from "../../config";
import {Axis} from "./Axis";
import {equals} from "../../utils/math.utils";
import {Scale} from "./Scale";
import {Drawing} from "../../tools/Drawing";
import {DataFlag} from "./DataFlag";


export class Chart {
  constructor(element, lines, options) {
    this.el = element;
    this.axis = options.axis;
    this.bounds = options.bounds;
    this.linesGroup = new LinesGroup(lines, {
      bounds: this.bounds,
      nSteps: Y_SCALE_STEPS
    });
  }

  setViewBox(viewBox) {
    this.viewBox = viewBox;

    if (this.drawing)
      this.drawing.resize(viewBox);

    if (this.xAxis)
      this.xAxis.resize(viewBox);
  }

  draw() {
    this.drawing = new Drawing(this.viewBox, {
      onHover: (identifier, x) => {
        this.dataFlag.showAt(x, identifier);
      },
      onHoverEnd: (identifier) => {
        this.dataFlag.hide(identifier);
      }
    });

    this.xAxis = new Axis(this.axis.values, {
      bounds: this.bounds,
      viewBox: this.viewBox
    });

    this.yScale = new Scale(this.linesGroup, {

    });

    this.dataFlag = new DataFlag(this.linesGroup, this.drawing);

    this.xAxis.appendTo(this.el);
    this.yScale.appendTo(this.el);
    this.dataFlag.appendTo(this.el);
    this.drawing.appendTo(this.el);
  }

  renderData() {
    this.drawing.drawLinesGroup(this.linesGroup);

    this.xAxis.render();
    this.yScale.render();
  }

  setBounds(bounds) {
    if (equals(bounds[0], this.bounds[0], TIME_COMPARISON_PRECISION) &&
        equals(bounds[1], this.bounds[1], TIME_COMPARISON_PRECISION))
      return;

    this.bounds = bounds;
    this.linesGroup.setHorizontalBounds(bounds);
    this.xAxis.setBounds(bounds);
  }

  finishInteraction() {
    this.xAxis.finishInteraction();
    this.linesGroup.finishInteraction();
  }
}
