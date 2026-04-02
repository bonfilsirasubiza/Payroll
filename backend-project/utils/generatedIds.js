const extractTrailingNumber = (value) => {
  const match = String(value ?? '').match(/(\d+)$/);
  return match ? Number(match[1]) : NaN;
};

const buildGeneratedCode = (prefix, number, padLength = 3) => {
  return `${prefix}${String(number).padStart(padLength, '0')}`;
};

const getNextGeneratedCode = async (Model, fieldName, prefix, padLength = 3) => {
  const records = await Model.find({}, { [fieldName]: 1 }).lean();
  const highestExistingCode = records.reduce((max, record) => {
    const numericValue = extractTrailingNumber(record?.[fieldName]);
    return Number.isFinite(numericValue) && numericValue > max ? numericValue : max;
  }, 0);

  const nextNumericValue = Math.max(highestExistingCode, records.length) + 1;
  return buildGeneratedCode(prefix, nextNumericValue, padLength);
};

module.exports = {
  buildGeneratedCode,
  getNextGeneratedCode
};
