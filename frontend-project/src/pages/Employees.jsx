import { useState, useEffect, useMemo } from 'react';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useToast } from '../components/ToastProvider';
import { Edit2, Trash2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { getApiErrorMessage } from '../utils/apiError';
import { formatFRW } from '../utils/formatters';
import { buildGeneratedCode, getDescendingGeneratedCodeForRow, getNextGeneratedCode } from '../utils/generatedIds';
import { sortRecordsDescending } from '../utils/sortRecords';

export const Employees = () => {
  const actionButtonClass = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all duration-200 hover:-translate-y-0.5";
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employeeCode: '', name: '', position: '', phone: '', basicSalary: '' });
  const headers = ["Employee ID", "Name", "Position", "Phone", "Basic Salary", "Actions"];
  const { showLoading, showSuccess, showError } = useToast();
  const nextEmployeeCode = getNextGeneratedCode(employees, 'employeeCode', 'EMP_');
  const sortedEmployees = useMemo(() => sortRecordsDescending(employees, ['employeeCode', '_id']), [employees]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get('/employees');
        setEmployees(res.data);
      } catch (err) {
        console.error('Failed to load employees', err);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setForm({ employeeCode: '', name: '', position: '', phone: '', basicSalary: '' });
    setEditingEmployee(null);
    setIsEditing(false);
    setIsOpen(false);
  };

  const openCreateForm = () => {
    setForm({ employeeCode: nextEmployeeCode, name: '', position: '', phone: '', basicSalary: '' });
    setEditingEmployee(null);
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    showLoading(isEditing ? 'Updating employee...' : 'Saving employee...');

    try {
      const payload = {
        name: form.name,
        position: form.position,
        phone: form.phone,
        basicSalary: Number(form.basicSalary)
      };

      if (isEditing && editingEmployee) {
        const res = await axiosInstance.put(`/employees/${editingEmployee._id}`, payload);
        setEmployees(prev => prev.map((emp) => emp._id === editingEmployee._id ? res.data : emp));
        showSuccess('Employee updated successfully.');
        resetForm();
        return;
      }

      const res = await axiosInstance.post('/employees', payload);
      setEmployees(prev => [res.data, ...prev]);
      showSuccess('Employee saved successfully.');
      resetForm();
    } catch (err) {
      console.error('Save employee failed', err);
      showError(getApiErrorMessage(err, 'Failed to save employee.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (employee, index) => {
    setForm({
      employeeCode: employee.employeeCode || buildGeneratedCode('EMP_', index + 1),
      name: employee.name,
      position: employee.position,
      phone: employee.phone,
      basicSalary: employee.basicSalary?.toString() || ''
    });
    setEditingEmployee(employee);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    showLoading('Deleting employee...');

    try {
      await axiosInstance.delete(`/employees/${employeeId}`);
      setEmployees(prev => prev.filter(emp => emp._id !== employeeId));
      showSuccess('Employee deleted successfully.');
    } catch (err) {
      console.error('Delete employee failed', err);
      showError(getApiErrorMessage(err, 'Failed to delete employee.'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Employee Directory</h1>
            <p className="text-slate-300 mt-2 font-medium">Manage and organize all staff information</p>
            <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-4"></div>
          </div>
          <div className="flex justify-end">
            <button onClick={openCreateForm} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95">+ New Employee</button>
          </div>
        </div>

      <Table 
        headers={headers}
        data={sortedEmployees}
        pageSize={3}
        variant="blue"
        renderRow={(emp, index) => (
            <>
            <td className="px-6 py-4 font-mono text-sm text-blue-200 whitespace-nowrap">
              {getDescendingGeneratedCodeForRow(sortedEmployees.length, index, 'EMP_')}
            </td>
            <td className="px-6 py-4 font-bold text-blue-50">{emp.name}</td>
            <td className="px-6 py-4 text-blue-100/80">{emp.position}</td>
            <td className="px-6 py-4 text-blue-100/80">{emp.phone}</td>
            <td className="px-6 py-4 font-mono font-bold text-emerald-300 whitespace-nowrap">{formatFRW(emp.basicSalary)}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(emp, index)}
                aria-label="Edit employee"
                title="Edit employee"
                className={`${actionButtonClass} text-blue-100 hover:bg-cyan-500 hover:text-slate-950`}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(emp._id)}
                aria-label="Delete employee"
                title="Delete employee"
                className={`${actionButtonClass} text-blue-100 hover:bg-red-500 hover:text-white`}
              >
                <Trash2 size={16} />
              </button>
              </div>
            </td>
          </>
        )}
      />

      {isOpen && (
        <Modal title={isEditing ? 'Edit Employee' : 'Register New Employee'} onClose={resetForm}>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
            <Input label="Employee ID" value={form.employeeCode} readOnly />
            <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <Input label="Position" value={form.position} onChange={e => setForm({...form, position: e.target.value})} required />
            <Input label="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            <Input
              label="Basic Salary (FRW)"
              type="number"
              value={form.basicSalary}
              onChange={e => setForm({ ...form, basicSalary: e.target.value })}
              min="0"
              required
            />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={resetForm} disabled={isSubmitting} className="w-full">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Saving...' : isEditing ? 'Update Employee' : 'Save Employee'}</Button>
            </div>
          </form>
        </Modal>
      )}
      </div>
    </div>
  
  );
};
