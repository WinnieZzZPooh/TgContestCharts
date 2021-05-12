/**
 * Create DOM element from HTML string
 * @param {string} html
 * @returns {HTMLElement}
 */
export function elementFromString(html) {
  let tmpl = document.createElement('template');
  tmpl.innerHTML = html.trim();
  return tmpl.content.firstChild;
}
