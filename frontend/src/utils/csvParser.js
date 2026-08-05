/**
 * Robust Client-Side CSV Parser for Master Data Datasets
 */

export function parseCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];

  // Remove UTF-8 Byte Order Mark (BOM) if present
  const cleanText = csvText.replace(/^\uFEFF/, '');

  const lines = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      if (currentLine.trim()) lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);

  if (lines.length === 0) return [];

  // Helper to split a single CSV line into cell values
  function splitLine(line) {
    const cells = [];
    let currentCell = '';
    let inside = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const nextC = line[i + 1];

      if (c === '"') {
        if (inside && nextC === '"') {
          currentCell += '"';
          i++;
        } else {
          inside = !inside;
        }
      } else if (c === ',' && !inside) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += c;
      }
    }
    cells.push(currentCell.trim());
    return cells;
  }

  const rawHeaders = splitLine(lines[0]);
  
  // Normalize headers to snake_case field keys (e.g. "Item Code" -> "item_code", "Doctor Name" -> "doctor_name")
  const headers = rawHeaders.map(h => {
    return h
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  });

  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const rowValues = splitLine(lines[i]);
    if (rowValues.length === 0 || (rowValues.length === 1 && !rowValues[0])) continue;

    const rowObj = {};
    headers.forEach((headerKey, idx) => {
      if (!headerKey) return;
      let val = rowValues[idx] ?? '';
      
      // Trim wrapping quotes if present
      if (typeof val === 'string') {
        val = val.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).trim();
        }
      }

      // Convert numeric fields if applicable
      if (val !== '' && !isNaN(val) && !val.includes('-') && !val.startsWith('0') && val.length < 10) {
        const num = Number(val);
        if (!isNaN(num)) val = num;
      }
      if (val === 'true' || val === 'TRUE') val = true;
      if (val === 'false' || val === 'FALSE') val = false;

      rowObj[headerKey] = val;
    });

    records.push(rowObj);
  }

  return records;
}
