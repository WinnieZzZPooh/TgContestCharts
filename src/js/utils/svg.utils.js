import { round } from "./math.utils";

/**
 * Convert array of Point objects into a string for SVG <polyline> element points
 * @param {Array<Point>} points
 * @param {ViewBox} viewBox
 * @returns string
 */
export function toPolylinePoints(points, viewBox) {
  return points.map(([x, y]) => {
    return `${round(x, 2)},${round(viewBox[1] - y, 2)}`;
  }).join(' ');
}

/**
 * Create SVG <polyline> element
 * @param {string} points
 * @param {string?} color
 * @returns {SVGElement}
 */
export function createPolyline(points, color = '#000000') {
  let el = elementFromString(
    `<polyline points="${points}" stroke="${color}"/>`
  );

  return el;
}

/**
 * Create DOM element from HTML string
 * @param {string} html
 * @returns {SVGElement}
 */
export function elementFromString(html) {
  let tmpl = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  tmpl.innerHTML = html.trim();
  return tmpl.firstChild;
}

/**
 * Apply 2D CSS transformation given by matrix
 * @param {SVGElement} el
 * @param {TransformationMatrix} matrix
 */
export function applyTransformationMatrix(el, matrix) {
  el.style.webkitTransform = `matrix(${matrix.join(',')})`;
  el.style.transform = `matrix(${matrix.join(',')})`;
  el.setAttribute('transform', `matrix(${matrix.join(',')})`);
}
