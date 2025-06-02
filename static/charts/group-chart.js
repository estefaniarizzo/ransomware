import { CONFIG } from '../config.js';

export function getGroupChartConfig(data) {
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
        title: {
          display: true,
          text: 'Attacks by Group',
          font: { size: 16 }
        }
      }
    }
  };
}