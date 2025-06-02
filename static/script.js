/**
 * Dashboard de Ransomware - Frontend Completo
 * Integrado con backend Flask
 */

// Configuración global
const CONFIG = {
  apiUrl: '/data',  // Endpoint de tu backend
  maxCountries: 10,
  maxGroups: 5
};

// Elementos del DOM
const DOM = {
  filters: document.getElementById('filters'),
  totalVictims: document.getElementById('totalVictims'),
  tableBody: document.getElementById('victimTableBody'),
  loading: document.getElementById('loading')
};

// Charts
let charts = {
  country: null,
  group: null,
  timeline: null
};

/* ----- Funciones Principales ----- */

async function loadData() {
  try {
    showLoading(true);
    
    const params = new URLSearchParams();
    Array.from(DOM.filters.elements).forEach(el => {
      if (el.name && el.value) params.append(el.name, el.value);
    });
    
    const response = await fetch(`${CONFIG.apiUrl}?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const { victims, chart_data, total } = await response.json();
    
    updateUI(victims, chart_data, total);
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

function updateUI(victims, chartData, total) {
  // Actualizar contador
  DOM.totalVictims.textContent = total;
  
  // Renderizar componentes
  renderVictimsTable(victims);
  renderCharts(chartData);
}

/* ----- Renderizado ----- */
function setupRowHoverEffects() {
  const rows = document.querySelectorAll('.victim-item');
  
  rows.forEach(row => {
    // Configura la transición inicial
    row.style.transition = 'all 0.3s ease-out';
    
    // Efecto al entrar el mouse
    row.addEventListener('mouseenter', () => {
      row.style.transform = 'translateX(2px)';
      row.style.boxShadow = `
        0 0 8px rgba(231, 76, 60, 0.4),
        0 0 12px rgba(231, 76, 60, 0.1)
      `;
    });
    
    // Efecto al salir el mouse
    row.addEventListener('mouseleave', () => {
      row.style.transform = 'translateX(0)';
      row.style.boxShadow = 'none';
    });
  });
}

function renderVictimsTable(victims) {
  DOM.tableBody.innerHTML = '';
  
  if (victims.length === 0) {
    DOM.tableBody.innerHTML = `
      <tr><td colspan="6" class="px-4 py-2 text-center text-gray-500">
        No victims found with current filters
      </td></tr>
    `;
    return;
  }
  
  victims.forEach(victim => {
    const stolenItems = victim.infostealer 
      ? Object.keys(victim.infostealer).length 
      : 0;
    
    const row = `
      <tr class="victim-item border-t hover:bg-gray-50">
        <td class="px-4 py-2 font-medium">${escapeHtml(victim.victim || 'N/A')}</td>
        <td class="px-4 py-2 uppercase">${victim.country || 'N/A'}</td>
        <td class="px-4 py-2 text-red-600 font-medium">${victim.group || 'N/A'}</td>
        <td class="px-4 py-2">${victim.attackdate || 'N/A'}</td>
        <td class="px-4 py-2">${victim.sector || 'N/A'}</td>
        <td class="px-4 py-2" title="${stolenItems ? JSON.stringify(victim.infostealer) : 'No data'}">
          ${stolenItems ? `${stolenItems} fields` : 'N/A'}
        </td>
      </tr>
    `;
    DOM.tableBody.innerHTML += row;
  });
  setupRowHoverEffects();
}

function renderCharts(data) {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#f3f4f6' : '#374151';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

   // Config común para todos los gráficos
  const commonOptions = {
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } }
    },
    plugins: { legend: { labels: { color: textColor } } }
  };
  // Destruir gráficos existentes
  Object.values(charts).forEach(chart => chart && chart.destroy());
  
  // Gráfico de países
  charts.country = new Chart(
    document.getElementById('countryChart'),
    getCountryChartConfig(data.by_country)
  );
  
  // Gráfico de grupos
  charts.group = new Chart(
    document.getElementById('groupChart'),
    getGroupChartConfig(data.by_group)
  );
  
  // Gráfico de timeline
  charts.timeline = new Chart(
    document.getElementById('timelineChart'),
    getTimelineChartConfig(data.timeline)
  );
}

/* ----- Configuraciones de Gráficos ----- */

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
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Number of Attacks' }
        },
        x: {
          title: { display: true, text: 'Country Code' }
        }
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
        backgroundColor: [
          '#3498db', '#e74c3c', '#2ecc71', 
          '#f39c12', '#9b59b6'
        ]
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
      scales: {
        y: { beginAtZero: true }
      }
    }
  };
}

/* ----- Utilidades ----- */

function detectAnomalies(victims) {
  if (victims.length < 10) return;  // Muestra muy pequeña
  
  const countryCounts = victims.reduce((acc, v) => {
    if (v.country) acc[v.country] = (acc[v.country] || 0) + 1;
    return acc;
  }, {});
  
  const avg = Object.values(countryCounts).reduce((a, b) => a + b, 0) / Object.keys(countryCounts).length;
  const anomalies = Object.entries(countryCounts)
    .filter(([_, count]) => count > avg * 1.5);
  
  if (anomalies.length > 0) {
    console.warn('Anomalies detected:', anomalies);
    // Puedes mostrar esto en la UI si lo prefieres
  }
}

function showLoading(show) {
  DOM.loading.style.display = show ? 'flex' : 'none';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

/* ----- Inicialización ----- */

document.addEventListener('DOMContentLoaded', () => {
  // Cargar datos iniciales
  loadData();
  
  // Configurar eventos
  DOM.filters.addEventListener('submit', (e) => {
    e.preventDefault();
    loadData();
  });
});


// Modo oscuro - Persistencia con localStorage
const darkModeToggle = document.getElementById('darkModeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Cargar preferencia guardada o del sistema
if (localStorage.getItem('darkMode') === 'true' || 
    (!localStorage.getItem('darkMode') && prefersDarkScheme.matches)) {
  document.documentElement.classList.add('dark');
}

// Alternar modo oscuro
darkModeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark);
  
  // Cambiar icono
  darkModeToggle.textContent = isDark ? '☀️' : '🌓';
});

//export
class DataExporter {
  static toCSV(victims) {
    const headers = ['Organization', 'Country', 'Group', 'Date', 'Sector', 'Stolen Data Fields'];
    const rows = victims.map(v => [
      `"${v.victim || 'N/A'}"`,
      `"${v.country || 'N/A'}"`,
      `"${v.group || 'N/A'}"`,
      `"${v.attackdate || 'N/A'}"`,
      `"${v.sector || 'N/A'}"`,
      `"${v.infostealer ? Object.keys(v.infostealer).length : '0'}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.download(blob, 'ransomware_victims.csv');
  }

  static toExcel(victims) {
    const data = victims.map(v => ({
      Organization: v.victim || 'N/A',
      Country: v.country || 'N/A',
      Group: v.group || 'N/A',
      Date: v.attackdate || 'N/A',
      Sector: v.sector || 'N/A',
      'Stolen Data': v.infostealer ? Object.keys(v.infostealer).length : 0
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Victims');
    XLSX.writeFile(workbook, 'ransomware_victims.xlsx');
  }

  static toPDF(victims) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.autoTable({
      head: [['Organization', 'Country', 'Group', 'Date', 'Sector', 'Stolen Data']],
      body: victims.map(v => [
        v.victim || 'N/A',
        v.country || 'N/A',
        v.group || 'N/A',
        v.attackdate || 'N/A',
        v.sector || 'N/A',
        v.infostealer ? Object.keys(v.infostealer).length : 0
      ]),
      headStyles: { 
        fillColor: [231, 76, 60],
        textColor: 255
      },
      bodyStyles: {
        textColor: [33, 37, 41]
      }
    });
    
    doc.save('ransomware_victims.pdf');
  }

  static download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}

// Inicialización del menú desplegable
document.addEventListener('DOMContentLoaded', () => {
  let currentVictims = [];
  const exportWarning = document.getElementById('exportWarning');
  const dropdownBtn = document.getElementById('exportDropdownBtn');
  const dropdownMenu = document.getElementById('exportDropdown');

  // Control del menú desplegable
  dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('hidden');
    dropdownMenu.classList.toggle('show');
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', () => {
    dropdownMenu.classList.add('hidden');
    dropdownMenu.classList.remove('show');
  });

  // Manejar las opciones de exportación
  document.querySelectorAll('.export-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const format = e.currentTarget.getAttribute('data-format');
      handleExport(format);
    });
  });

  // Sobrescribir loadData para capturar los datos mostrados
  const originalLoadData = window.loadData;
  window.loadData = async function() {
    try {
      const result = await originalLoadData.apply(this, arguments);
      
      // Captura las víctimas mostradas en la tabla
      currentVictims = Array.from(document.querySelectorAll('#victimTableBody tr'))
        .filter(tr => !tr.textContent.includes('No victims found'))
        .map(tr => {
          const cells = tr.querySelectorAll('td');
          return {
            victim: cells[0].textContent.trim(),
            country: cells[1].textContent.trim(),
            group: cells[2].textContent.trim(),
            attackdate: cells[3].textContent.trim(),
            sector: cells[4].textContent.trim(),
            infostealer: cells[5].getAttribute('title') || null
          };
        });
      
      return result;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  // Función para verificar filtros activos
  function hasActiveFilters() {
    const inputs = document.querySelectorAll('#filters input');
    return Array.from(inputs).some(input => {
      return input.value && input.value.trim() !== '' && input.value !== 'N/A';
    });
  }

  // Controlador de exportación
  function handleExport(format) {
    if (!hasActiveFilters()) {
      exportWarning.textContent = '⚠️ Aplica al menos un filtro antes de exportar';
      exportWarning.classList.remove('hidden');
      setTimeout(() => exportWarning.classList.add('hidden'), 3000);
      return;
    }
    
    if (currentVictims.length === 0) {
      alert('No hay datos visibles para exportar');
      return;
    }
    
    switch(format) {
      case 'csv': DataExporter.toCSV(currentVictims); break;
      case 'excel': DataExporter.toExcel(currentVictims); break;
      case 'pdf': DataExporter.toPDF(currentVictims); break;
    }
  }
});