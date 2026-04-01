import { useState, useEffect, useMemo } from 'react';
import { Table } from '../components/Table';
import { exportToCSV } from '../utils/exportCSV';
import axiosInstance from '../api/axiosInstance';

const monthList = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
];

export const Reports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ employeeId: 'all', payMonth: 'all' });
  const [message, setMessage] = useState('');

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

  const loadEmployees = async () => {
    try {
      const res = await axiosInstance.get('/employees');
      setEmployees(res.data || []);
    } catch (error) {
      console.error('Failed to load employees', error);
      setEmployees([]);
    }
  };

  const loadReports = async (employeeId = filters.employeeId, payMonth = filters.payMonth) => {
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
  };

  useEffect(() => {
    loadEmployees();
    loadReports();
  }, []);

  const handleExport = () => {
    exportToCSV(data, ["Employee", "Net Salary", "Pay Month", "Basic Salary", "Total Allowances", "Total Deductions"], ["employeeName", "netSalary", "paymentMonth", "basicSalary", "totalAllowances", "totalDeductions"], "Payroll_Report");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Financial Reports</h1>
        <button onClick={handleExport} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg">Export CSV</button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 md:items-end">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase ml-2">Employee Name</label>
          <select
            value={filters.employeeId}
            onChange={(e) => setFilters((prev) => ({ ...prev, employeeId: e.target.value }))}
            className="mt-1 w-full p-3 border rounded-xl bg-gray-50"
          >
            <option value="all">All Employees</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>{emp.name || emp.fullName || emp.email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase ml-2">Pay Month</label>
          <select
            value={filters.payMonth}
            onChange={(e) => setFilters((prev) => ({ ...prev, payMonth: e.target.value }))}
            className="mt-1 w-full p-3 border rounded-xl bg-gray-50"
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => loadReports(filters.employeeId, filters.payMonth)}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Apply Filter
          </button>
          <button
            onClick={() => {
              setFilters({ employeeId: 'all', payMonth: 'all' });
              loadReports('all', 'all');
            }}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
          >
            Reset
          </button>
        </div>
      </div>

      {message && <div className="text-sm text-indigo-700 font-semibold">{message}</div>}

      {loading ? (
        <div>Loading reports...</div>
      ) : (
        <Table
          headers={["Employee", "Basic Salary", "Total Allowances", "Total Deductions", "Net Salary", "Pay Month"]}
          data={data}
          pageSize={3}
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