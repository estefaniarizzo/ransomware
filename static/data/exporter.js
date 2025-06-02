export class DataExporter {
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
      headStyles: { fillColor: [231, 76, 60], textColor: 255 },
      bodyStyles: { textColor: [33, 37, 41] }
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
