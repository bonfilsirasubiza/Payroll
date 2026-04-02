import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Table } from '../components/Table'; // Import our reusable table
import { Users, Wallet, TrendingDown, Receipt, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatFRW, formatPayMonth, getRealTimeDate } from '../utils/formatters';
import { getDescendingRowNumber } from '../utils/generatedIds';
import { sortRecordsDescending } from '../utils/sortRecords';
import axiosInstance from '../api/axiosInstance';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAllowances: 0,
    totalDeductions: 0,
    netPayroll: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetching Stats and Recent Payroll simultaneously
        const [empRes, allowanceRes, deductionRes, payrollRes] = await Promise.all([
          axiosInstance.get('/employees'),
          axiosInstance.get('/allowances'),
          axiosInstance.get('/deductions'),
          axiosInstance.get('/payrolls') // This should return your payment history
        ]); 

        // Calculate Stats
        const totalEmp = empRes.data.length || 0;
        const totalAllowances = Array.isArray(allowanceRes.data)
          ? allowanceRes.data.reduce((sum, item) => sum + Number(item.amount || 0), 0)
          : 0;
        const totalDeductions = Array.isArray(deductionRes.data)
          ? deductionRes.data.reduce((sum, item) => sum + Number(item.amount || 0), 0)
          : 0;
        const totalNet = payrollRes.data.reduce((acc, curr) => acc + (Number(curr.totalSalary ?? curr.netSalary) || 0), 0);
        
        setStats({
          totalEmployees: totalEmp,
          totalAllowances,
          totalDeductions,
          netPayroll: totalNet
        });

        // Keep the dashboard table newest-first and only show the latest five rows
        setRecentPayments(sortRecordsDescending(payrollRes.data, ['paymentDate', '_id']).slice(0, 5));
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="animate-spin text-blue-400" size={40} />
      </div>
    );
  }

  const employeeName = user?.username || user?.name || user?.fullName || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="space-y-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Welcome, {employeeName}</h1>
          <p className="text-sm text-gray-300 mt-2 font-medium">{getRealTimeDate()}</p>
          <div className="h-1 w-24 bg-yellow-400 rounded-full mt-4"></div>
        </div>
      </header>

      {/* Cards Grid (2 cards per row on larger screens) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card title="Staff Members" value={stats.totalEmployees} icon={Users} color="blue" to="/employees" hint="Open employee records" />
        <Card title="Allowances" value={formatFRW(stats.totalAllowances)} icon={Wallet} color="green" to="/allowances" hint="Total allowance money" />
        <Card title="Deductions" value={formatFRW(stats.totalDeductions)} icon={TrendingDown} color="red" to="/deductions" hint="Total deduction money" />
        <Card title="Net Payroll" value={formatFRW(stats.netPayroll)} icon={Receipt} color="yellow" to="/payroll" hint="Go to payroll processing" />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">Recent Payroll Activity</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-3"></div>
      </div>

      {/* Recent Activity Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-100 uppercase tracking-tight flex items-center gap-2">
            <Calendar className="text-blue-400" size={24} />
            Recent Disbursements
          </h2>
          <button className="text-blue-400 text-sm font-bold hover:underline">View All Reports</button>
        </div>

        <Table
          headers={["No.", "Employee Name", "Amount Paid", "Payment Date", "Pay Month"]}
          data={recentPayments}
          pageSize={3}
          renderRow={(pay, index) => (
            <>
              <td className="px-6 py-4 font-mono text-sm text-gray-300 whitespace-nowrap">
                {getDescendingRowNumber(recentPayments.length, index)}
              </td>
              <td className="px-6 py-4 font-bold text-gray-100">
                {pay.employeeId?.fullName || pay.employeeId?.name || pay.employee?.name || pay.employee?.fullName || "Unknown Employee"}
              </td>
              <td className="px-6 py-4">
                <span className="bg-green-900 text-green-300 px-3 py-1 rounded-lg font-black text-sm">
                  {formatFRW(pay.netSalary || pay.totalSalary || 0)}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-300 text-sm">
                {new Date(pay.createdAt || pay.paymentDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-black uppercase text-blue-300 bg-blue-900 px-2 py-1 rounded">
                  {formatPayMonth(pay.payMonth) || "N/A"}
                </span>
              </td>
            </>
          )}
        />
      </div>
    </div>
    </div>
  );
};
