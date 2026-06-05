import { jsPDF } from 'jspdf';

/**
 * Downloads a dataset as a CSV file.
 */
export function exportToCsv(columns: string[], rows: any[], filename = 'query_results.csv'): void {
  if (!columns || columns.length === 0 || !rows || rows.length === 0) {
    console.warn('CSV Export failed: No data available.');
    return;
  }

  // Map header labels
  const csvHeaders = columns.join(',');
  
  // Map row values and escape columns with commas
  const csvRows = rows.map(row => {
    return columns.map(col => {
      const val = row[col] === null || row[col] === undefined ? '' : row[col].toString();
      // If the value contains commas, quotes, or newlines, wrap it in double quotes and escape internal quotes
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
  });

  const csvContent = [csvHeaders, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Compiles a beautiful, highly formatted PDF report using jsPDF.
 */
export function exportToPdf(
  question: string,
  sql: string,
  explanation: any,
  columns: string[],
  rows: any[]
): void {
  const doc = new jsPDF();
  let y = 20;

  // Title: Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AI DATABASE PLATFORM REPORT', 15, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 28);
  y = 45;

  // Section 1: User Question
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('USER QUESTION:', 15, y);
  y += 5;
  
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const splitQuestion = doc.splitTextToSize(question || 'No question provided.', 180);
  doc.text(splitQuestion, 15, y);
  y += (splitQuestion.length * 5) + 5;

  // Section 2: Generated SQL Code block
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('GENERATED SQL QUERY:', 15, y);
  y += 5;

  // Draw light grey box for code
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  const splitSql = doc.splitTextToSize(sql || 'No query generated.', 170);
  const boxHeight = (splitSql.length * 5) + 6;
  doc.rect(15, y, 180, boxHeight, 'FD');

  doc.setTextColor(22, 101, 52); // Dark Green
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text(splitSql, 18, y + 5);
  y += boxHeight + 8;

  // Section 3: AI Query Explanation
  if (explanation) {
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('AI QUERY EXPLANATION:', 15, y);
    y += 5;

    doc.setTextColor(30, 41, 59); // Slate-800
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitDesc = doc.splitTextToSize(explanation.description || 'N/A', 180);
    doc.text(splitDesc, 15, y);
    y += (splitDesc.length * 5) + 4;

    // Show tables used and confidence
    const tablesUsed = explanation.tables ? explanation.tables.join(', ') : 'None';
    doc.setFont('helvetica', 'bold');
    doc.text(`Tables Used: `, 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(tablesUsed, 38, y);
    
    if (explanation.confidence_score) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Confidence Score: `, 115, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${explanation.confidence_score}%`, 148, y);
    }
    y += 10;
  }

  // Section 4: Data Results Table
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`QUERY RESULTS (${rows ? rows.length : 0} Rows):`, 15, y);
  y += 6;

  // Draw basic table headers
  if (columns && columns.length > 0 && rows && rows.length > 0) {
    const colWidth = 180 / columns.length;
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(15, y, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    columns.forEach((col, idx) => {
      // Clean header label
      const headerText = col.toUpperCase();
      doc.text(headerText, 17 + (idx * colWidth), y + 5.5);
    });
    y += 8;

    // Draw rows
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    const rowsToPrint = rows.slice(0, 25); // Limit page to 25 rows to fit on 1 page report
    rowsToPrint.forEach((row, rIdx) => {
      // Zebra striping
      if (rIdx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(15, y, 180, 7, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.line(15, y + 7, 195, y + 7);

      columns.forEach((col, cIdx) => {
        const val = row[col] === null || row[col] === undefined ? 'NULL' : row[col].toString();
        // Truncate text if too long to fit in cell
        const cellText = doc.clipStringToWidth(val, colWidth - 4, { text: val });
        doc.text(cellText, 17 + (cIdx * colWidth), y + 5);
      });
      y += 7;
    });

    if (rows.length > 25) {
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.text(`... and ${rows.length - 25} more records (truncated for page layout).`, 15, y + 6);
    }
  } else {
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    doc.text('No results returned from database execution.', 15, y + 5);
  }

  doc.save('query_execution_report.pdf');
}

/**
 * Downloads query history as a text file.
 */
export function exportQueryHistory(history: string[]): void {
  if (!history || history.length === 0) {
    console.warn('History Export failed: No history logs available.');
    return;
  }

  const content = history.map((item, index) => `${index + 1}. ${item}`).join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'query_history_log.txt');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
