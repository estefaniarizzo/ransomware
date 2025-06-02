import { DOM } from '../dom-elements.js';

export function showLoading(show) {
  DOM.loading.style.display = show ? 'flex' : 'none';
}
