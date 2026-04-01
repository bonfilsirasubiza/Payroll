/**
 * Utility to export JSON data to a CSV file
 * @param {Array} data - The array of objects to export
 * @param {Array} headers - The column titles (e.g., ["Name", "Salary"])
 * @param {Array} keys - The keys in the object matching the headers (e.g., ["name", "salary"])
 * @param {string} fileName - The desired name for the downloaded file
 */
export const exportToCSV = (data, headers, keys, fileName = "report") => {
  if (!data || !data.length) {
    alert("No data available to export");
    return;
  }

  // 1. Create the CSV Header row
  const csvRows = [];
  csvRows.push(headers.join(','));

  // 2. Map the data to rows based on keys
  for (const row of data) {
    const values = keys.map(key => {
      const value = row[key] === null || row[key] === undefined ? "" : row[key];
      // Escape double quotes and wrap in quotes to handle commas within data
      const escaped = ('' + value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  // 3. Create a Blob and trigger download
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};