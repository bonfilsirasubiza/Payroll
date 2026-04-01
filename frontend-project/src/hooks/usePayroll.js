import { useState, useMemo } from 'react';

export const usePayrollCalc = (initialData = { basic: 0, allowances: [], deductions: [] }) => {
  const [data, setData] = useState(initialData);

  const totals = useMemo(() => {
    const totalAllowances = data.allowances.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalDeductions = data.deductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const netSalary = Number(data.basic) + totalAllowances - totalDeductions;

    return {
      totalAllowances,
      totalDeductions,
      netSalary
    };
  }, [data]);

  return { data, setData, totals };
};