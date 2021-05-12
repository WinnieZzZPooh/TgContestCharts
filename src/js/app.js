/**
 * @typedef {[number, number]} Point - [x, y]
 * @typedef {[number, number]} Bounds - [min, max]
 * @typedef {[number, number]} ViewBox - [width, height]
 * @typedef {[number, number, number, number, number, number]} TransformationMatrix - [a, b, c, d, tx, ty]
 */

import { ChartBox } from './components/ChartBox';
import {THEMES, TOUCH_SUPPORT, WELCOME_MESSAGE_DELAY} from './config';


export function startApp(data) {
  setTheme();
  renderCharts(data);
  enableThemeSwitcher();
  preventDefaultBehavior();
}

function setTheme(theme) {
  const switcher = document.getElementById('theme-switcher');

  if (!theme) {
    let initialTheme;

    if (window.localStorage) {
      initialTheme = window.localStorage.getItem('css-theme');
      theme = THEMES.includes(initialTheme) ? initialTheme : THEMES[0];
    }
  }

  document.body.setAttribute('data-theme', theme);
  switcher.firstElementChild.innerText = theme === THEMES[0] ? THEMES[1] : THEMES[0];

  if (window.localStorage)
    window.localStorage.setItem('css-theme', theme);
}

function renderCharts(data) {
  const container = document.getElementById('root');

  let charts = data.map((chartData, i) => {
    return new ChartBox(container, chartData, `Chart Title #${i + 1}`);
  });

  setTimeout(() => {
    charts.forEach(chart => chart.render());

    window.addEventListener('resize', () => {
      charts.forEach(chart => chart.resize());
    });

    window.addEventListener('orientationchange', () => {
      charts.forEach(chart => chart.resize());
    });

    stopLauncher();
  }, 0);

}

function stopLauncher() {
  let launcher = document.getElementById('launcher');

  launcher.classList.add('done');

  setTimeout(() => {
    launcher.parentElement.removeChild(launcher);
    document.getElementsByClassName('theme-switcher')[0].classList.add('fly-in');
  }, 1000);
}

function enableThemeSwitcher() {
  const switcher = document.getElementById('theme-switcher');
  let prevTimeout;

  switcher.addEventListener('click', () => {
    document.body.classList.add('changing-theme');
    setTheme(document.body.getAttribute('data-theme') === 'day' ? 'night' : 'day');

    clearTimeout(prevTimeout);

    prevTimeout = setTimeout(() => {
      document.body.classList.remove('changing-theme');
    }, 200);
  });
}

function preventDefaultBehavior() {
  document.addEventListener('touchmove', (e) => {
    if (e.scale > 1)
      e.preventDefault();
  }, { passive: false, capture: true });
}


function _bindWelcomeMessageEvents() {
  let wm = document.getElementById('welcome-message');
  let closeBtn = document.getElementById('welcome-message-close');

  closeBtn.addEventListener('click', () => {
    wm.classList.remove('shown');
    setTimeout(() => {
      wm.parentElement.removeChild(wm);
    }, 500);

    window.localStorage.setItem('closed-welcome-message', 'true');
  }, { once: true });
}
