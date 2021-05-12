import * as DOM from '../../utils/dom.utils';
import {format} from "../../utils/date.utils";


export class Axis {
  constructor(values, options) {
    this.values = values;
    this.bounds = options.bounds;
    this.width = options.viewBox[0] || 1;
    this.nSteps = this._getNumberOfSteps();
  }

  appendTo(container) {
    this._createElement();
    container.appendChild(this.el);
  }

  setBounds(bounds) {
    this.bounds = bounds;
    let step = this._getActualTimeStep();

    if (this.initialPD < step) {
      this.initialPD = step;
      this.render();
    } else {
      this._move();
      this._renderLabels();
    }
  }

  resize(viewBox) {
    this.width = viewBox[0];
    this.nSteps = this._getNumberOfSteps();
    this.render();
  }

  render() {
    this.el.innerHTML = '';
    this._createNodes();
    this._renderLabels();
  }

  finishInteraction() {
    this.el.classList.add('hidden-axis');

    this.el.addEventListener('transitionend', () => {
      this.render();
      this.el.classList.remove('hidden-axis');
    }, {once: true});
  }

  _createElement() {
    this.el = DOM.elementFromString(`<div class="x-axis"></div>`);
  }

  _createNodes() {
    let diff = this.bounds[1] - this.bounds[0];

    this.leftmostNode = {
      x: this.bounds[0],
      pd: diff, // "parent-distance"
      text: format(this.bounds[0])
    };
    this.rightmostNode = {
      x: this.bounds[1],
      pd: diff,
      text: format(this.bounds[1])
    };

    this.initialPD = diff;

    this._fillNodes(this.leftmostNode, this.rightmostNode, this._getActualTimeStep());
    this._move();
  }

  _fillNodes(n1, n2, step) {
    if (n2.x - n1.x >= step) {
      let x = (n2.x + n1.x) / 2;
      let nNew = {
        x: x,
        pd: n2.x - x,
        next: n2,
        text: format(x)
      };

      n1.next = nNew;

      this._fillNodes(n1, nNew, step);
      this._fillNodes(nNew, n2, step);
    } else {
      n1.next = n2;
    }
  }

  _move() {
    this._addBranchesOnTheEdges();
    this._moveAndUpdate();
  }

  _addBranchesOnTheEdges() {
    let step = this._getActualTimeStep();
    let leftNode = this.leftmostNode,
      rightNode = this.rightmostNode;

    if (leftNode.x >= this.bounds[0] + step / 2) {
      let newX = leftNode.x - leftNode.pd;
      this.leftmostNode = {
        x: newX,
        text: format(newX),
        pd: leftNode.pd
      };
      this._fillNodes(this.leftmostNode, leftNode, step);
    }

    if (rightNode.x <= this.bounds[1] - step / 2) {
      let newX = rightNode.x + rightNode.pd;
      this.rightmostNode = {
        x: newX,
        text: format(newX),
        pd: rightNode.pd
      };
      this._fillNodes(rightNode, this.rightmostNode, step);
    }
  }

  _moveAndUpdate() {
    let diff = this.bounds[1] - this.bounds[0];
    let step = this._getActualTimeStep();

    let node = this.leftmostNode;
    let prevNode;

    do {
      if (node.pd < step / 4) {
        this._deleteNode(node, prevNode);
      } else {
        if (node.next)
          this._fillNodes(node, node.next, step);

        node.left = (node.x - this.bounds[0]) / diff;
        prevNode = node;
      }

      node = node.next;
    } while (node);
  }

  _deleteNode(node, prevNode) {
    if (prevNode)
      prevNode.next = node.next;
    else
      this.leftmostNode = node.next;

    if (node.el && node.el.parentElement) {
      this.el.removeChild(node.el);
      node.el = null;
    }
  }

  _renderLabels() {
    let diff = this.bounds[1] - this.bounds[0];
    let step = this._getActualTimeStep();
    let node = this.leftmostNode;

    do {
      let opacity = Math.max(0, Math.min(1, 2 * node.pd / step - 1));
      let left = node.left;

      if (opacity === 0 || left < -step / diff || left > 1 + step / diff) {
        if (node.el && node.el.parentElement)
          this.el.removeChild(node.el);

        node = node.next;
        continue;
      }

      let tx = -Math.max(0, Math.min(100, left * 100));

      if (!node.el)
        node.el = DOM.elementFromString(
          `<div class="label">${node.text}</div>`
        );

      node.el.style.left = left * 100 + '%';
      node.el.style.opacity = opacity;
      node.el.style.transform = `translateX(${tx}%)`;

      if (!node.el.parentElement)
        this.el.appendChild(node.el);

      node = node.next;
    } while (node);
  }

  _getNumberOfSteps() {
    return this.width < 1000 ? 4 : 8;
  }

  _getActualTimeStep() {
    let [lo, hi] = this.bounds;
    let diff = hi - lo;
    return diff / this.nSteps;
  }
}
