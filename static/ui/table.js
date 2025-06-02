import { DOM } from '../dom-elements.js';

export function setupRowHoverEffects() {
  const rows = document.querySelectorAll('.victim-item');

  rows.forEach(row => {
    row.style.transition = 'all 0.3s ease-out';

    row.addEventListener('mouseenter', () => {
      row.style.transform = 'translateX(2px)';
      row.style.boxShadow = `
        0 0 8px rgba(231, 76, 60, 0.4),
        0 0 12px rgba(231, 76, 60, 0.1)
      `;
    });

    row.addEventListener('mouseleave', () => {
      row.style.transform = 'translateX(0)';
      row.style.boxShadow = 'none';
    });
  });
}

export function renderVictimsTable(victims) {
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

export function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}
