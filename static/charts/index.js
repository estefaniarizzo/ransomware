import { CONFIG } from '../dom-elements.js';

export function renderCharts(data, charts) {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#f3f4f6' : '#374151';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  Object.values(charts).forEach(chart => chart && chart.destroy());

  charts.country = new Chart(
    document.getElementById('countryChart'),
    getCountryChartConfig(data.by_country)
  );

  charts.group = new Chart(
    document.getElementById('groupChart'),
    getGroupChartConfig(data.by_group)
  );

  charts.timeline = new Chart(
    document.getElementById('timelineChart'),
    getTimelineChartConfig(data.timeline)
  );
}

function getCountryChartConfig(data) {
  const countries = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, CONFIG.maxCountries);

  return {
    type: 'bar',
    data: {
      labels: countries.map(c => c[0]),
      datasets: [{
        label: 'Attacks by Country',
        data: countries.map(c => c[1]),
        backgroundColor: '#3498db',
        borderColor: '#2980b9',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Number of Attacks' } },
        x: { title: { display: true, text: 'Country Code' } }
      }
    }
  };
}

function getGroupChartConfig(data) {
  const groups = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, CONFIG.maxGroups);

  return {
    type: 'pie',
    data: {
      labels: groups.map(g => g[0]),
      datasets: [{
        data: groups.map(g => g[1]),
        backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Attacks by Group', font: { size: 16 } }
      }
    }
  };
}

function getTimelineChartConfig(data) {
  const timeline = Object.entries(data)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]));

  return {
    type: 'line',
    data: {
      labels: timeline.map(t => t[0]),
      datasets: [{
        label: 'Attacks Timeline',
        data: timeline.map(t => t[1]),
        borderColor: '#e74c3c',
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  };
}
