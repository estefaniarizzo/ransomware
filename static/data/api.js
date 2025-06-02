import { CONFIG, DOM } from '../dom-elements.js';
import { showLoading } from '../ui/loading.js';
import { renderVictimsTable } from '../ui/table.js';
import { renderCharts } from '../charts/index.js';

let charts = {
  country: null,
  group: null,
  timeline: null
};

export async function loadData() {
  try {
    showLoading(true);

    const params = new URLSearchParams();
    Array.from(DOM.filters.elements).forEach(el => {
      if (el.name && el.value) params.append(el.name, el.value);
    });

    const response = await fetch(`${CONFIG.apiUrl}?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const { victims, chart_data, total } = await response.json();

    DOM.totalVictims.textContent = total;
    renderVictimsTable(victims);
    renderCharts(chart_data, charts);

    detectAnomalies(victims);

  } catch (error) {
    console.error('Error loading data:', error);
    DOM.tableBody.innerHTML = `
      <tr><td colspan="6" class="text-red-500 px-4 py-2 text-center">
        Error: ${error.message}
      </td></tr>
    `;
  } finally {
    showLoading(false);
  }
}

function detectAnomalies(victims) {
  if (victims.length < 10) return;
  const countryCounts = victims.reduce((acc, v) => {
    if (v.country) acc[v.country] = (acc[v.country] || 0) + 1;
    return acc;
  }, {});
  const avg = Object.values(countryCounts).reduce((a, b) => a + b, 0) / Object.keys(countryCounts).length;
  const anomalies = Object.entries(countryCounts)
    .filter(([_, count]) => count > avg * 1.5);
  if (anomalies.length > 0) {
    console.warn('Anomalies detected:', anomalies);
  }
}
