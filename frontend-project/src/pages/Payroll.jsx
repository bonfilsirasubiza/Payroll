import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../components/Modal';
import { Table } from '../components/Table';
import { Input } from '../components/Input';
import { useToast } from '../components/ToastProvider';
import { Edit2, Trash2 } from 'lucide-react';
import { formatFRW, formatPayMonth } from '../utils/formatters';
import axiosInstance from '../api/axiosInstance';
import { getEmployeeRefId, getEmployeeRefName } from '../utils/employeeRefs';
import { getApiErrorMessage } from '../utils/apiError';
import { buildGeneratedCode, getDescendingGeneratedCodeForRow, getNextGeneratedCode } from '../utils/generatedIds';
import { sortRecordsDescending } from '../utils/sortRecords';

export const Payroll = () => {
  const actionButtonClass = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all duration-200 hover:-translate-y-0.5";
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [calc, setCalc] = useState({ basic: 0, allowance: 0, deduction: 0 });
  const net = Number(calc.basic) + Number(calc.allowance) - Number(calc.deduction);

  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [payMonths, setPayMonths] = useState([]);
  const [form, setForm] = useState({ payrollCode: '', employee: '', payMonth: '', paymentDate: '' });
  const { showLoading, showSuccess, showError } = useToast();
  const nextPayrollCode = getNextGeneratedCode(payrolls, 'payrollCode', 'PAY_');
  const sortedPayrolls = useMemo(() => sortRecordsDescending(payrolls, ['paymentDate', '_id']), [payrolls]);

  const resolvedBasicSalary = useMemo(() => {
    if (!form.employee) return 0;

    const editingEmployeeId = editingPayroll ? getEmployeeRefId(editingPayroll.employee) : '';
    if (isEditing && editingPayroll && form.employee === editingEmployeeId) {
      return Number(editingPayroll.basicSalary) || 0;
    }

    const selectedEmployee = employees.find((item) => item._id === form.employee);
    const latestPayroll = payrolls.find((item) => getEmployeeRefId(item.employee) === form.employee);
    return Number(selectedEmployee?.basicSalary) || Number(latestPayroll?.basicSalary) || 0;
  }, [form.employee, employees, payrolls, isEditing, editingPayroll]);

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, payRes, allowRes, dedRes] = await Promise.all([
          axiosInstance.get('/employees'),
          axiosInstance.get('/payrolls'),
          axiosInstance.get('/allowances'),
          axiosInstance.get('/deductions')
        ]);

        setEmployees(empRes.data);
        setPayrolls(payRes.data);
        setAllowances(allowRes.data);
        setDeductions(dedRes.data);

        const monthSet = new Set(payRes.data.map(item => item.payMonth).filter(Boolean));
        const defaultMonth = new Date();
        monthSet.add(`${defaultMonth.getFullYear()}-${(defaultMonth.getMonth()+1).toString().padStart(2, '0')}`);

        setPayMonths(Array.from(monthSet).sort((a,b) => a.localeCompare(b)));
      } catch (err) {
        console.error('Failed to load payroll data', err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const selectedId = form.employee;
    const basicSalary = resolvedBasicSalary;

    const totalAllowance = allowances
      .filter(a => (a.employee?._id || a.employee) === selectedId)
      .reduce((acc, a) => acc + (Number(a.amount) || 0), 0);

    const totalDeduction = deductions
      .filter(d => (d.employee?._id || d.employee) === selectedId)
      .reduce((acc, d) => acc + (Number(d.amount) || 0), 0);

    setCalc({
      basic: basicSalary,
      allowance: totalAllowance,
      deduction: totalDeduction
    });
  }, [form.employee, resolvedBasicSalary, allowances, deductions]);

  const handleEdit = (p, index) => {
    if (!p) return;
    setEditingPayroll(p);
    setIsEditing(true);
    setForm({
      payrollCode: p.payrollCode || buildGeneratedCode('PAY_', index + 1),
      employee: getEmployeeRefId(p.employee),
      payMonth: p.payMonth || '',
      paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : ''
    });
    setCalc({ basic: p.basicSalary || 0, allowance: p.totalAllowance || 0, deduction: p.totalDeduction || 0 });
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payroll?')) return;
    showLoading('Deleting payroll...');

    try {
      await axiosInstance.delete(`/payrolls/${id}`);
      setPayrolls(prev => prev.filter(item => item._id !== id));
      showSuccess('Payroll deleted successfully.');
    } catch (err) {
      console.error('Failed to delete payroll', err);
      showError(getApiErrorMessage(err, 'Failed to delete payroll.'));
    }
  };

  const resetForm = () => {
    setForm({ payrollCode: '', employee: '', payMonth: '', paymentDate: '' });
    setCalc({ basic: 0, allowance: 0, deduction: 0 });
    setIsEditing(false);
    setEditingPayroll(null);
    setIsOpen(false);
  };

  const openCreateForm = () => {
    setForm({ payrollCode: nextPayrollCode, employee: '', payMonth: '', paymentDate: '' });
    setCalc({ basic: 0, allowance: 0, deduction: 0 });
    setIsEditing(false);
    setEditingPayroll(null);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    showLoading(isEditing ? 'Updating payroll...' : 'Processing payroll...');

    try {
      const payload = {
        employee: form.employee,
        basicSalary: resolvedBasicSalary,
        paymentDate: form.paymentDate,
        payMonth: form.payMonth || (form.paymentDate ? form.paymentDate.slice(0, 7) : undefined)
      };

      if (isEditing && editingPayroll) {
        const res = await axiosInstance.put(`/payrolls/${editingPayroll._id}`, payload);
        setPayrolls(prev => prev.map(item => item._id === editingPayroll._id ? res.data.payroll || res.data : item));
        showSuccess('Payroll updated successfully.');
        resetForm();
        return;
      }

      const res = await axiosInstance.post('/payrolls', payload);
      setPayrolls(prev => [res.data.payroll, ...prev]);
      showSuccess('Payroll processed successfully.');
      resetForm();
    } catch (err) {
      console.error('Failed to save payroll', err);
      showError(getApiErrorMessage(err, 'Failed to save payroll.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-4xl font-black text-white">Monthly Payroll Processing</h1>
          <p className="text-slate-300 mt-2 font-medium">Process and manage employee salaries</p>
          <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-4"></div>
        </div>
        <div className="flex justify-end">
          <button onClick={openCreateForm} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95">+ Process Payroll</button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-950 to-blue-950 p-8 rounded-2xl border border-blue-900/70 shadow-sm">
        <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-6">Recent Payrolls</h3>
        <Table
          headers={["Payroll ID", "Employee", "Total Salary", "Payment Date", "Pay Month", "Actions"]}
          data={sortedPayrolls}
          pageSize={3}
          variant="blue"
          renderRow={(p, index) => (
            <>
              <td className="px-6 py-4 font-mono text-sm text-blue-200 whitespace-nowrap">
                {getDescendingGeneratedCodeForRow(sortedPayrolls.length, index, 'PAY_')}
              </td>
              <td className="px-6 py-4 text-blue-50">{getEmployeeRefName(p.employee, employees)}</td>
              <td className="px-6 py-4 font-mono font-bold text-cyan-200">{formatFRW(p.totalSalary || p.netSalary || 0)}</td>
              <td className="px-6 py-4 text-blue-100/70 text-sm">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : ''}</td>
              <td className="px-6 py-4 text-blue-50">{formatPayMonth(p.payMonth) || 'N/A'}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(p, index)}
                  aria-label="Edit payroll"
                  title="Edit payroll"
                  className={`${actionButtonClass} text-blue-100 hover:bg-cyan-500 hover:text-slate-950`}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  aria-label="Delete payroll"
                  title="Delete payroll"
                  className={`${actionButtonClass} text-blue-100 hover:bg-red-500 hover:text-white`}
                >
                  <Trash2 size={16} />
                </button>
                </div>
              </td>
            </>
          )}
        />
      </div>

      {isOpen && (
        <Modal title={isEditing ? 'Edit Payroll' : 'Process Payroll'} onClose={resetForm}>
          <div className="space-y-4">
            <Input label="Payroll ID" value={form.payrollCode} readOnly />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase ml-1 tracking-wide">Employee Name</label>
                <select
                  value={form.employee}
                  onChange={e => setForm({...form, employee: e.target.value})}
                  className="mt-2 w-full p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase ml-1 tracking-wide">Pay Month</label>
                <select
                  value={form.payMonth}
                  onChange={e => setForm({...form, payMonth: e.target.value})}
                  className="mt-2 w-full p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                  required
                >
                  <option value="">Select Month</option>
                  {payMonths.map((month) => (
                    <option key={month} value={month}>{formatPayMonth(month)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase ml-1 tracking-wide">Payment Date</label>
                <input
                  type="date"
                  value={form.paymentDate}
                  onChange={e => {
                    const selectedDate = e.target.value;
                    const derivedMonth = selectedDate ? selectedDate.slice(0, 7) : '';
                    setForm({...form, paymentDate: selectedDate, payMonth: derivedMonth});
                  }}
                  className="mt-2 w-full p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                  required
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-5 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <p className="text-xs text-gray-600 uppercase font-bold tracking-widest mb-3">Total Allowance</p>
                <p className="text-2xl font-black text-green-600">{formatFRW(calc.allowance)}</p>
              </div>
              <div className="rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50 p-5 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <p className="text-xs text-gray-600 uppercase font-bold tracking-widest mb-3">Total Deduction</p>
                <p className="text-2xl font-black text-red-600">-{formatFRW(calc.deduction)}</p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <p className="text-xs text-gray-600 uppercase font-bold tracking-widest mb-3">Basic Salary</p>
                <p className="text-2xl font-black text-blue-600">{formatFRW(calc.basic)}</p>
              </div>
              <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-5 text-center shadow-md hover:shadow-lg transition-all duration-200">
                <p className="text-xs text-gray-600 uppercase font-bold tracking-widest mb-3">Net Salary</p>
                <p className="text-2xl font-black text-purple-600">{formatFRW(net)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => resetForm()} disabled={isSubmitting} className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100">
                {isSubmitting ? 'Processing...' : isEditing ? 'Update Payroll' : 'Submit Payroll'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
    </div>
  );
};
