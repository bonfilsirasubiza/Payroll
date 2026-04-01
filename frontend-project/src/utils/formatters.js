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
 * Formats dates into: March 2024
 */
export const formatPayMonth = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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