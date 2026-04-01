import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Table } from '../components/Table'; // Import our reusable table
import { Users, Wallet, TrendingDown, Receipt, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatFRW, getRealTimeDate } from '../utils/formatters';
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
        const [empRes, payrollRes] = await Promise.all([
          axiosInstance.get('/employees'),
          axiosInstance.get('/payrolls') // This should return your payment history
        ]);

        // Calculate Stats
        const totalEmp = empRes.data.length || 0;
        const totalNet = payrollRes.data.reduce((acc, curr) => acc + curr.netSalary, 0);
        
        setStats({
          totalEmployees: totalEmp,
          totalAllowances: 0, // Update based on your logic
          totalDeductions: 0, // Update based on your logic
          netPayroll: totalNet
        });

        // Set table data (taking last 5 payments)
        setRecentPayments(payrollRes.data.slice(0, 5));
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
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const employeeName = user?.name || user?.fullName || 'Employee';

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter">Welcome {employeeName}</h1>
          <p className="text-sm text-gray-500 mb-1">{getRealTimeDate()}</p>
          <div className="h-1 w-24 bg-yellow-400 rounded-full"></div>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-gray-500 uppercase">Live Database Connection</span>
        </div>
      </header>

      {/* Cards Grid (2 cards per row on larger screens) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card title="Staff Members" value={stats.totalEmployees} icon={Users} color="blue" />
        <Card title="Allowances" value={formatFRW(stats.totalAllowances)} icon={Wallet} color="green" />
        <Card title="Deductions" value={formatFRW(stats.totalDeductions)} icon={TrendingDown} color="red" />
        <Card title="Net Payout" value={formatFRW(stats.netPayroll)} icon={Receipt} color="yellow" />
      </div>

      <div className="mt-4">
        <h2 className="text-2xl font-black uppercase tracking-tight">Recent Payroll</h2>
      </div>

      {/* Recent Activity Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <Calendar className="text-blue-600" size={24} />
            Recent Disbursements
          </h2>
          <button className="text-blue-600 text-sm font-bold hover:underline">View All Reports</button>
        </div>

        <Table
          headers={["Employee Name", "Amount Paid", "Payment Date", "Pay Month"]}
          data={recentPayments}
          pageSize={3}
          renderRow={(pay) => (
            <>
              <td className="px-6 py-4 font-bold text-gray-800">
                {pay.employeeId?.fullName || pay.employee?.name || "Unknown Employee"}
              </td>
              <td className="px-6 py-4">
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg font-black text-sm">
                  {formatFRW(pay.netSalary || pay.totalSalary || 0)}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500 text-sm">
                {new Date(pay.createdAt || pay.paymentDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-black uppercase text-blue-500 bg-blue-50 px-2 py-1 rounded">
                  {pay.payMonth || "N/A"}
                </span>
              </td>
            </>
          )}
          renderCard={(pay) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="font-bold">{pay.employeeId?.fullName || pay.employee?.name || 'Unknown'}</div>
                <div className="font-black text-green-700">{formatFRW(pay.netSalary || pay.totalSalary || 0)}</div>
              </div>
              <div className="text-sm text-gray-500">{new Date(pay.createdAt || pay.paymentDate).toLocaleDateString()}</div>
              <div className="text-xs uppercase text-blue-600 font-bold">{pay.payMonth || 'N/A'}</div>
            </div>
          )}
        />
      </div>
    </div>
  );
};