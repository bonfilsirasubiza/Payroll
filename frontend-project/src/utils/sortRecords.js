const getValueByPath = (item, path) => {
  if (typeof path === 'function') {
    return path(item);
  }

  if (!path) {
    return undefined;
  }

  return String(path)
    .split('.')
    .reduce((acc, key) => (acc == null ? acc : acc[key]), item);
};

const compareDescending = (left, right) => {
  if (left === right) {
    return 0;
  }

  if (left === null || left === undefined || left === '') {
    return 1;
  }

  if (right === null || right === undefined || right === '') {
    return -1;
  }

  const leftDate = left instanceof Date ? left.getTime() : Date.parse(left);
  const rightDate = right instanceof Date ? right.getTime() : Date.parse(right);

  if (Number.isFinite(leftDate) && Number.isFinite(rightDate)) {
    return rightDate - leftDate;
  }

  const leftNumber = typeof left === 'number' ? left : Number(left);
  const rightNumber = typeof right === 'number' ? right : Number(right);

  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && String(left).trim() !== '' && String(right).trim() !== '') {
    return rightNumber - leftNumber;
  }

  return String(right).localeCompare(String(left), undefined, {
    numeric: true,
    sensitivity: 'base'
  });
};

export const sortRecordsDescending = (records = [], selectors = ['_id']) => {
  if (!Array.isArray(records)) {
    return [];
  }

  return [...records].sort((a, b) => {
    for (const selector of selectors) {
      const left = getValueByPath(a, selector);
      const right = getValueByPath(b, selector);
      const comparison = compareDescending(left, right);

      if (comparison !== 0) {
        return comparison;
      }
    }

    return 0;
  });
};
