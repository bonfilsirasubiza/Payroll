/**
 * Formats numbers into: 500,000 FRW
 * We export it as both formatFRW and formatCurrency to satisfy all components.
 */
export const formatFRW = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0 FRW";
  
  return new Intl.NumberFormat('en-RW', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(value) + ' FRW';
};

// Create an alias so formatCurrency also works
export const formatCurrency = formatFRW;

/**
 * Formats pay month strings into: 2024-March
 */
export const formatPayMonth = (value) => {
  if (!value) return "";

  const normalized = String(value).slice(0, 7);
  const [year, month] = normalized.split('-');
  const monthIndex = Number(month) - 1;

  if (!year || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return String(value);
  }

  const monthName = new Date(Date.UTC(Number(year), monthIndex, 1)).toLocaleString('en-US', {
    month: 'long',
    timeZone: 'UTC'
  });

  return `${year}-${monthName}`;
};

/**
 * Real-time Date for Dashboard Header
 */
export const getRealTimeDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
