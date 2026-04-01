import { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { Table } from '../components/Table';
import { Edit2, Trash2 } from 'lucide-react';
import { formatFRW } from '../utils/formatters';
import axiosInstance from '../api/axiosInstance';

export const Payroll = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [calc, setCalc] = useState({ basic: 0, allowance: 0, deduction: 0 });
  const net = Number(calc.basic) + Number(calc.allowance) - Number(calc.deduction);

  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [payMonths, setPayMonths] = useState([]);
  const [form, setForm] = useState({ employee: '', payMonth: '', paymentDate: '', basicSalary: '' });

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
    const basicSalary = Number(form.basicSalary) || 0;

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
  }, [form.employee, form.basicSalary, allowances, deductions]);

  const handleEdit = (p) => {
    if (!p) return;
    setEditingPayroll(p);
    setIsEditing(true);
    setForm({
      employee: p.employee?._id || '',
      payMonth: p.payMonth || '',
      paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : '',
      basicSalary: p.basicSalary?.toString() || ''
    });
    setCalc({ basic: p.basicSalary || 0, allowance: p.totalAllowance || 0, deduction: p.totalDeduction || 0 });
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payroll?')) return;
    try {
      await axiosInstance.delete(`/payrolls/${id}`);
      setPayrolls(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete payroll', err);
      alert('Failed to delete payroll');
    }
  };

  const resetForm = () => {
    setForm({ employee: '', payMonth: '', paymentDate: '', basicSalary: '' });
    setCalc({ basic: 0, allowance: 0, deduction: 0 });
    setIsEditing(false);
    setEditingPayroll(null);
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee: form.employee,
        basicSalary: Number(form.basicSalary),
        paymentDate: form.paymentDate,
        payMonth: form.payMonth || (form.paymentDate ? form.paymentDate.slice(0, 7) : undefined)
      };

      if (isEditing && editingPayroll) {
        const res = await axiosInstance.put(`/payrolls/${editingPayroll._id}`, payload);
        setPayrolls(prev => prev.map(item => item._id === editingPayroll._id ? res.data.payroll || res.data : item));
        resetForm();
        return;
      }

      const res = await axiosInstance.post('/payrolls', payload);
      setPayrolls(prev => [res.data.payroll, ...prev]);
      resetForm();
    } catch (err) {
      console.error('Failed to create payroll', err);
      alert('Failed to create payroll');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Monthly Payroll</h1>
        <button onClick={() => { resetForm(); setIsOpen(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg">+ Process Payroll</button>
      </div>

      <div className="bg-white rounded-3xl border p-12 text-center text-gray-400 italic">
        Select a month or employee to view historical payroll records.
      </div>

      <div className="bg-white p-6 rounded-2xl border">
        <h3 className="font-bold mb-2">Recent Payrolls</h3>
        <Table
          headers={["Employee", "Total Salary", "Payment Date", "Pay Month", "Actions"]}
          data={payrolls}
          pageSize={3}
          renderRow={(p) => (
            <>
              <td className="px-6 py-4">{p.employee?.name || 'Unknown'}</td>
              <td className="px-6 py-4 font-mono font-bold">{formatFRW(p.totalSalary || p.netSalary || 0)}</td>
              <td className="px-6 py-4 text-gray-500 text-sm">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : ''}</td>
              <td className="px-6 py-4">{p.payMonth || 'N/A'}</td>
              <td className="px-6 py-4 space-x-2">
                <button onClick={() => handleEdit(p)} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                  <Edit2 size={16} />
                  Edit
                </button>
                <button onClick={() => handleDelete(p._id)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800">
                  <Trash2 size={16} />
                  Delete
                </button>
              </td>
            </>
          )}
        />
      </div>

      {isOpen && (
        <Modal title={isEditing ? 'Edit Payroll' : 'Process Payroll'} onClose={resetForm}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Employee Name</label>
                <select
                  value={form.employee}
                  onChange={e => setForm({...form, employee: e.target.value})}
                  className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Pay Month</label>
                <select
                  value={form.payMonth}
                  onChange={e => setForm({...form, payMonth: e.target.value})}
                  className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Month</option>
                  {payMonths.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                <input
                  type="date"
                  value={form.paymentDate}
                  onChange={e => {
                    const selectedDate = e.target.value;
                    const derivedMonth = selectedDate ? selectedDate.slice(0, 7) : '';
                    setForm({...form, paymentDate: selectedDate, payMonth: derivedMonth});
                  }}
                  className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Basic Salary</label>
                <input
                  type="number"
                  value={form.basicSalary}
                  onChange={e => setForm({...form, basicSalary: e.target.value})}
                  className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 uppercase">Total Allowance</p>
                <p className="text-xl font-black text-green-600">{formatFRW(calc.allowance)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 uppercase">Total Deduction</p>
                <p className="text-xl font-black text-red-600">-{formatFRW(calc.deduction)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 uppercase">Basic Salary</p>
                <p className="text-xl font-black text-blue-600">{formatFRW(calc.basic)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 text-center bg-gray-50">
                <p className="text-xs text-gray-500 uppercase">Total Salary</p>
                <p className="text-xl font-black text-indigo-600">{formatFRW(net)}</p>
              </div>
            </div>

            <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition-all">
              {isEditing ? 'Update Payroll' : 'Submit Payroll'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};