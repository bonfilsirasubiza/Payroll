const extractTrailingNumber = (value) => {
  const match = String(value ?? '').match(/(\d+)$/);
  return match ? Number(match[1]) : NaN;
};

export const buildGeneratedCode = (prefix, number, padLength = 3) => {
  return `${prefix}${String(number).padStart(padLength, '0')}`;
};

export const getNextGeneratedCode = (records = [], fieldName, prefix, padLength = 3) => {
  const highestExistingCode = records.reduce((max, record) => {
    const numericValue = extractTrailingNumber(record?.[fieldName]);
    return Number.isFinite(numericValue) && numericValue > max ? numericValue : max;
  }, 0);

  const nextNumericValue = Math.max(highestExistingCode, records.length) + 1;
  return buildGeneratedCode(prefix, nextNumericValue, padLength);
};

export const getGeneratedCodeForRow = (_value, index, prefix, padLength = 3) => {
  // Table rows should always display a count-based code like EMP_001, EMP_002, etc.
  // The stored value is still used in forms and backend data, but the list view is
  // derived from the current row position so newly inserted records render cleanly.
  return buildGeneratedCode(prefix, index + 1, padLength);
};

export const getDescendingRowNumber = (totalCount, index) => {
  if (!Number.isFinite(totalCount) || totalCount <= 0) {
    return index + 1;
  }

  return totalCount - index;
};

export const getDescendingGeneratedCodeForRow = (totalCount, index, prefix, padLength = 3) => {
  return buildGeneratedCode(prefix, getDescendingRowNumber(totalCount, index), padLength);
};
