import { elementFromString } from '../utils/dom.utils';


export class ChartLegend {
  constructor(element, lines) {
    this.el = element;
    this.lines = lines;
    this.values = lines.map(line => ({
      key: line.key,
      label: line.name,
      enabled: line.enabled,
      color: line.color
    }));
  }

  renderData() {
    this.values.forEach(item => {
      let button = elementFromString(
        `<label class="legend-button">
          <input type="checkbox" value="${item.key}" ${item.enabled ? 'checked="checked"' : ''} />
          <span class="custom-checkbox" style="background-color: ${item.color}"></span>
          <span class="checkbox-label">${item.label}</span>
        </label>`
      );

      button.querySelector('input').addEventListener('change', (event) => {
        let line = this.lines.find(l => l.key === event.target.value);
        line.toggle();
      });

      this.el.appendChild(button);
    });
  }
}
