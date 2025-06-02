export function getTimelineChartConfig(data) {
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
      scales: {
        y: { beginAtZero: true }
      }
    }
  };
}