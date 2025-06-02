import { CONFIG } from '../config.js';

export function getCountryChartConfig(data) {
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