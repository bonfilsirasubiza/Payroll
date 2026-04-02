import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Table } from '../components/Table';
import { exportToCSV } from '../utils/exportCSV';
import axiosInstance from '../api/axiosInstance';

const monthList = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
];

const getEmployeeLabel = (employee) => (
  employee.name || employee.fullName || employee.email || employee.employeeCode || employee._id
);

export const Reports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ employeeId: 'all', payMonth: 'all' });
  const [employeeQuery, setEmployeeQuery] = useState('');
  const [isEmployeePickerOpen, setIsEmployeePickerOpen] = useState(false);
  const [message, setMessage] = useState('');
  const employeePickerRef = useRef(null);

  const monthOptions = useMemo(() => {
    const fromData = Array.from(new Set(data.map((item) => item.paymentMonth).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    if (fromData.length > 0) {
      return [{ value: 'all', label: 'All Months' }, ...fromData.map((m) => ({ value: m, label: m }))];
    }

    const year = new Date().getFullYear();
    return [
      { value: 'all', label: 'All Months' },
      ...monthList.map((m) => ({ value: `${year}-${m}`, label: `${year}-${m}` }))
    ];
  }, [data]);

  const selectedEmployee = useMemo(() => (
    filters.employeeId === 'all'
      ? null
      : employees.find((employee) => employee._id === filters.employeeId) || null
  ), [employees, filters.employeeId]);

  const filteredEmployees = useMemo(() => {
    const query = employeeQuery.trim().toLowerCase();

    return employees
      .filter((employee) => {
        if (!query) return true;

        return [
          employee.name,
          employee.fullName,
          employee.email,
          employee.employeeCode,
          employee.position,
          employee._id
        ].filter(Boolean).some((field) => String(field).toLowerCase().includes(query));
      })
      .sort((a, b) => getEmployeeLabel(a).localeCompare(getEmployeeLabel(b)));
  }, [employees, employeeQuery]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/employees');
      setEmployees(res.data || []);
    } catch (error) {
      console.error('Failed to load employees', error);
      setEmployees([]);
    }
  }, []);

  const loadReports = useCallback(async (employeeId = 'all', payMonth = 'all') => {
    setLoading(true);
    setMessage('');

    try {
      const res = await axiosInstance.post('/reports/report', {
        employeeId: employeeId || 'all',
        payMonth: payMonth || 'all',
        includeAggregates: true
      });

      if (res.data && res.data.data) {
        setData(res.data.data);
        if (res.data.summary) {
          setMessage(`Found ${res.data.summary.totalRecords || res.data.data.length} records`);
        } else {
          setMessage(`Found ${res.data.data.length} records`);
        }
      } else {
        setData([]);
        setMessage('No matching records found.');
      }
    } catch (err) {
      console.error('Failed to load reports', err);
      if (err?.response?.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage('Unable to load reports.');
      }
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (employeePickerRef.current && !employeePickerRef.current.contains(event.target)) {
        setIsEmployeePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!selectedEmployee) {
      return;
    }

    setEmployeeQuery(getEmployeeLabel(selectedEmployee));
  }, [selectedEmployee]);

  useEffect(() => {
    loadEmployees();
    loadReports('all', 'all');
  }, [loadEmployees, loadReports]);

  const handleExport = () => {
    exportToCSV(
      data,
      ['Employee', 'Net Salary', 'Pay Month', 'Basic Salary', 'Total Allowances', 'Total Deductions'],
      ['employeeName', 'netSalary', 'paymentMonth', 'basicSalary', 'totalAllowances', 'totalDeductions'],
      'Payroll_Report'
    );
  };

  const handleEmployeeSelect = (employeeId) => {
    if (employeeId === 'all') {
      setFilters((prev) => ({ ...prev, employeeId: 'all' }));
      setEmployeeQuery('');
      setIsEmployeePickerOpen(false);
      return;
    }

    const employee = employees.find((item) => item._id === employeeId);
    setFilters((prev) => ({ ...prev, employeeId }));
    setEmployeeQuery(employee ? getEmployeeLabel(employee) : '');
    setIsEmployeePickerOpen(false);
  };

  const handleClearEmployeeSelection = () => {
    setFilters((prev) => ({ ...prev, employeeId: 'all' }));
    setEmployeeQuery('');
    setIsEmployeePickerOpen(true);
  };

  const handleEmployeeKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsEmployeePickerOpen(false);
      return;
    }

    if (event.key !== 'Enter') {
      return;
    }

    const normalizedQuery = employeeQuery.trim().toLowerCase();
    const exactMatch = filteredEmployees.find((employee) => getEmployeeLabel(employee).toLowerCase() === normalizedQuery);

    if (exactMatch) {
      event.preventDefault();
      handleEmployeeSelect(exactMatch._id);
      return;
    }

    if (filteredEmployees.length === 1) {
      event.preventDefault();
      handleEmployeeSelect(filteredEmployees[0]._id);
    }
  };

  return (
    <div className="min-h-full space-y-6 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 text-blue-50 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-blue-100">Financial Reports</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-3xl border border-blue-800/60 bg-slate-900/70 p-6 shadow-2xl shadow-blue-950/30 md:grid-cols-3 md:items-end">
        <div ref={employeePickerRef} className="relative">
          <label className="ml-2 text-xs font-bold uppercase text-blue-200/70">Employee Name</label>
          <div className="mt-1 flex items-stretch overflow-hidden rounded-xl border border-blue-800/60 bg-slate-950/70 focus-within:border-cyan-400">
            <input
              type="text"
              value={employeeQuery}
              onChange={(e) => {
                setEmployeeQuery(e.target.value);
                setIsEmployeePickerOpen(true);

                if (filters.employeeId !== 'all') {
                  setFilters((prev) => ({ ...prev, employeeId: 'all' }));
                }
              }}
              onFocus={() => setIsEmployeePickerOpen(true)}
              onKeyDown={handleEmployeeKeyDown}
              placeholder="Search and select employee"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent p-3 text-blue-50 outline-none placeholder:text-blue-200/35"
            />
            {(employeeQuery.trim() || filters.employeeId !== 'all') && (
              <button
                type="button"
                onClick={handleClearEmployeeSelection}
                className="border-l border-blue-800/60 px-3 text-blue-200/70 transition hover:bg-blue-900/40 hover:text-blue-50"
                aria-label="Clear employee selection"
                title="Clear selection"
              >
                x
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsEmployeePickerOpen((prev) => !prev)}
              className="border-l border-blue-800/60 px-3 text-blue-200/70 transition hover:bg-blue-900/40 hover:text-blue-50"
              aria-label="Toggle employee list"
              title="Open employee list"
            >
              v
            </button>
          </div>

          {isEmployeePickerOpen && (
            <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-blue-800/70 bg-slate-950 shadow-2xl shadow-slate-950/60">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleEmployeeSelect('all')}
                className={`w-full border-b border-blue-800/50 px-4 py-3 text-left text-sm font-semibold transition hover:bg-blue-900/60 ${filters.employeeId === 'all' ? 'bg-blue-900/40 text-cyan-200' : 'text-blue-50'}`}
              >
                All Employees
              </button>

              <div className="max-h-64 overflow-y-auto">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <button
                      key={employee._id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleEmployeeSelect(employee._id)}
                      className={`w-full border-b border-blue-900/40 px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-900/60 ${filters.employeeId === employee._id ? 'bg-blue-900/40 text-cyan-200' : 'text-blue-50'}`}
                    >
                      <div className="font-semibold">{getEmployeeLabel(employee)}</div>
                      <div className="text-xs text-blue-200/55">
                        {employee.position || employee.employeeCode || employee.email || employee._id}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-sm text-blue-200/55">No employees found.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="ml-2 text-xs font-bold uppercase text-blue-200/70">Pay Month</label>
          <select
            value={filters.payMonth}
            onChange={(e) => setFilters((prev) => ({ ...prev, payMonth: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-blue-800/60 bg-slate-950/70 p-3 text-blue-50 outline-none transition focus:border-cyan-400"
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => loadReports(filters.employeeId, filters.payMonth)}
            className="w-full rounded-xl bg-blue-700 px-6 py-3 font-bold text-blue-50 transition hover:bg-blue-600"
          >
            Apply Filter
          </button>
          <button
            onClick={handleExport}
            className="w-full rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Export CSV
          </button>
        </div>
      </div>

      {message && <div className="text-sm font-semibold text-cyan-200">{message}</div>}

      {loading ? (
        <div className="text-blue-100/80">Loading reports...</div>
      ) : (
        <Table
          headers={['Employee', 'Basic Salary', 'Total Allowances', 'Total Deductions', 'Net Salary', 'Pay Month']}
          data={data}
          pageSize={3}
          variant="blue"
          renderRow={(item) => (
            <>
              <td className="px-6 py-4 font-bold">{item.employeeName}</td>
              <td className="px-6 py-4">{item.basicSalary ?? 0} FRW</td>
              <td className="px-6 py-4">{item.totalAllowances ?? 0} FRW</td>
              <td className="px-6 py-4">{item.totalDeductions ?? 0} FRW</td>
              <td className="px-6 py-4 font-mono font-bold">{item.netSalary ?? item.totalSalary ?? 0} FRW</td>
              <td className="px-6 py-4">{item.paymentMonth}</td>
            </>
          )}
        />
      )}
    </div>
  );
};
