import * as DOM from "../../utils/dom.utils";
import {TOUCH_SUPPORT} from "../../config";


export class Slider {
  constructor(parent, options) {
    this.parent = parent;
    this.onChange = options.onChange;
    this.onFinish = options.onFinish;
    this.scale = [0, 1];
    this.minScaleWidth = Math.max(options.minScaleWidth, 0.04);
  }

  setScale(scale) {
    if (!this.rendered)
      this._render();

    this.scale = scale;
    this._updateSlidingWindow();
  }

  _render() {
    this.slidingWindow = DOM.elementFromString(
      `<div class="sliding-window">
        <div class="grip left-grip"></div>
        <div class="grip right-grip"></div>
      </div>`);

    this.coverLeft = DOM.elementFromString(`<div class="cover cover-left"></div>`);
    this.coverRight = DOM.elementFromString(`<div class="cover cover-right"></div>`);

    this.parent.appendChild(this.coverLeft);
    this.parent.appendChild(this.coverRight);
    this.parent.appendChild(this.slidingWindow);

    this.rendered = true;

    this._makeDraggable();
  }

  _updateSlidingWindow() {
    this.slidingWindow.style.left = this.scale[0] * 100 + '%';
    this.slidingWindow.style.width = (this.scale[1] - this.scale[0]) * 100 + '%';

    this.coverLeft.style.width = this.scale[0] * 100 + '%';
    this.coverRight.style.left = this.scale[1] * 100 + '%';
  }

  _makeDraggable() {
    let bounds;
    let registeredTouches = {};

    let onStart = (e) => {
      bounds = this.parent.getBoundingClientRect();
      this.parent.classList.add('moving');

      let sliderBounds = this.slidingWindow.getBoundingClientRect();
      let touchDescriptor = e.changedTouches && e.changedTouches[0];
      let target = touchDescriptor ? touchDescriptor.target : e.target;
      let id = touchDescriptor ? touchDescriptor.identifier : 'mouse';
      let clientX = touchDescriptor && touchDescriptor.clientX || e.clientX;
      let deltaLeft = (clientX - sliderBounds.left) / bounds.width || 0;
      let mode = 'move';

      if (target.classList.contains('left-grip'))
        mode = 'left';
      else if (target.classList.contains('right-grip'))
        mode = 'right';

      for (let id in registeredTouches) {
        if (registeredTouches[id].mode === mode)
          return; // ignore touch with similar mode

        // transform 'move' touch into 'right' or 'left' mode (because 'move' mode does not work with other modes)
        // reset deltaLeft to move slider to the new position of touch
        if (registeredTouches[id].mode === 'move') {
          registeredTouches[id].mode = mode === 'left' ? 'right' : 'left';
          registeredTouches[id].deltaLeft = 0;
        } else if (mode === 'move') {
          mode = registeredTouches[id].mode === 'left' ? 'right' : 'left';
          deltaLeft = 0;
        }
      }

      if (Object.keys(registeredTouches).length === 0) { // only for the first touch
        if (TOUCH_SUPPORT) {
          // passive: false to prevent page scrolling (by calling e.preventDefault() later);
          // capture: true to achieve this behavior on iOS
          document.addEventListener('touchmove', onMove, { passive: false, capture: true });
          document.addEventListener('touchend', stopDD);
        } else {
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', stopDD);
        }
      }

      registeredTouches[id] = {
        deltaLeft,
        mode,
        touchLeft: (clientX - bounds.left) / bounds.width
      };

      e.preventDefault();
    };

    let onMove = (e) => {
      let [left, right] = this.scale;
      let width = right - left;
      let changedTouches = e.changedTouches || [{ identifier: 'mouse', clientX: e.clientX }];
      let anyUpdates = false;

      let processTouch = ({ deltaLeft, mode, touchLeft}) => {
        if (mode === 'right') {
          right = Math.min(1, touchLeft);
          right = Math.max(left + this.minScaleWidth, right);
        } else if (mode === 'left') {
          left = Math.max(0, touchLeft - deltaLeft);
          left = Math.min(right - this.minScaleWidth, left);
        } else {
          left = Math.max(0, touchLeft - deltaLeft);
          left = Math.min(1 - width, left);
          right = Math.min(1, left + width);
        }
      };

      for (let touch of changedTouches) {
        let registeredTouch = registeredTouches[touch.identifier];

        if (registeredTouch) {
          let touchLeft = (touch.clientX - bounds.left) / bounds.width;

          if (registeredTouch.touchLeft !== touchLeft) {
            registeredTouch.touchLeft = touchLeft;
            processTouch(registeredTouch);
            anyUpdates = true;
          }
        }
      }

      if (anyUpdates) {
        this.scale = [left, right];
        this._updateSlidingWindow();

        this.onChange(this.scale);
      }

      e.preventDefault();
    };

    let stopDD = (e) => {
      delete registeredTouches[e.changedTouches ? e.changedTouches[0].identifier : 'mouse'];
      if (Object.keys(registeredTouches).length === 0) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove, { capture: true });
        document.removeEventListener('mouseup', stopDD);
        document.removeEventListener('touchend', stopDD);

        this.parent.classList.remove('moving');
        this.onFinish();
      }

    };

    if (TOUCH_SUPPORT)
      this.slidingWindow.addEventListener('touchstart', onStart);
    else
      this.slidingWindow.addEventListener('mousedown', onStart);
  }
}
