import { useState, useEffect, useMemo } from 'react';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useToast } from '../components/ToastProvider';
import { Edit2, Trash2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { getEmployeeRefId, getEmployeeRefName } from '../utils/employeeRefs';
import { getApiErrorMessage } from '../utils/apiError';
import { buildGeneratedCode, getDescendingGeneratedCodeForRow, getNextGeneratedCode } from '../utils/generatedIds';
import { sortRecordsDescending } from '../utils/sortRecords';

export const Allowances = () => {
  const actionButtonClass = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all duration-200 hover:-translate-y-0.5";
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [editingAllowance, setEditingAllowance] = useState(null);
  const [form, setForm] = useState({ allowanceCode: '', employee: '', amount: '', description: '' });
  const { showLoading, showSuccess, showError } = useToast();
  const nextAllowanceCode = getNextGeneratedCode(allowances, 'allowanceCode', 'ALW_');
  const sortedAllowances = useMemo(() => sortRecordsDescending(allowances, ['allowanceCode', '_id']), [allowances]);

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, alRes] = await Promise.all([
          axiosInstance.get('/employees'),
          axiosInstance.get('/allowances')
        ]);
        setEmployees(empRes.data || []);
        setAllowances(alRes.data || []);
      } catch (err) {
        console.error('Failed to load allowances data', err);
      }
    };

    load();
  }, []);

  const resetForm = () => {
    setForm({ allowanceCode: '', employee: '', amount: '', description: '' });
    setEditingAllowance(null);
    setIsEditing(false);
    setIsOpen(false);
  };

  const openCreateForm = () => {
    setForm({ allowanceCode: nextAllowanceCode, employee: '', amount: '', description: '' });
    setEditingAllowance(null);
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    showLoading(isEditing ? 'Updating allowance...' : 'Saving allowance...');

    try {
      const payload = {
        employee: form.employee,
        amount: Number(form.amount),
        description: form.description
      };

      if (isEditing && editingAllowance) {
        const res = await axiosInstance.put(`/allowances/${editingAllowance._id}`, payload);
        setAllowances((prev) => prev.map((item) => item._id === editingAllowance._id ? res.data : item));
        showSuccess('Allowance updated successfully.');
        resetForm();
        return;
      }

      const res = await axiosInstance.post('/allowances', payload);
      setAllowances((prev) => [res.data, ...prev]);
      showSuccess('Allowance saved successfully.');
      resetForm();
    } catch (err) {
      console.error('Failed to save allowance', err);
      showError(getApiErrorMessage(err, 'Failed to save allowance.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (allowance, index) => {
    setEditingAllowance(allowance);
    setForm({
      allowanceCode: allowance.allowanceCode || buildGeneratedCode('ALW_', index + 1),
      employee: getEmployeeRefId(allowance.employee),
      amount: allowance.amount?.toString() || '',
      description: allowance.description || ''
    });
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this allowance?')) return;
    showLoading('Deleting allowance...');

    try {
      await axiosInstance.delete(`/allowances/${id}`);
      setAllowances((prev) => prev.filter((item) => item._id !== id));
      showSuccess('Allowance deleted successfully.');
    } catch (err) {
      console.error('Failed to delete allowance', err);
      showError(getApiErrorMessage(err, 'Failed to delete allowance.'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Employee Allowances</h1>
            <p className="text-slate-300 mt-2 font-medium">Manage and track employee allowances</p>
            <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-4"></div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={openCreateForm}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95"
            >
              + New Allowance
            </button>
          </div>
        </div>

        <Table
          headers={["Allowance ID", "Employee Name", "Amount", "Description", "Actions"]}
          data={sortedAllowances}
          pageSize={3}
          variant="blue"
          renderRow={(allowance, index) => (
            <>
              <td className="px-6 py-4 font-mono text-sm text-blue-200 whitespace-nowrap">
                {getDescendingGeneratedCodeForRow(sortedAllowances.length, index, 'ALW_')}
              </td>
              <td className="px-6 py-4 font-medium text-blue-50">
                {getEmployeeRefName(allowance.employee, employees)}
              </td>
              <td className="px-6 py-4 text-emerald-300 font-bold whitespace-nowrap">
                {allowance.amount}
              </td>
              <td className="px-6 py-4 text-blue-100/70 italic">
                {allowance.description || 'No description'}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(allowance, index)}
                    aria-label="Edit allowance"
                    title="Edit allowance"
                    className={`${actionButtonClass} text-blue-100 hover:bg-cyan-500 hover:text-slate-950`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(allowance._id)}
                    aria-label="Delete allowance"
                    title="Delete allowance"
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
          <Modal title={isEditing ? 'Edit Allowance' : 'Add New Allowance'} onClose={resetForm}>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <Input
                label="Allowance ID"
                value={form.allowanceCode}
                readOnly
              />
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase ml-1 tracking-wide">Employee Name</label>
                <select
                  className="mt-2 w-full p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  value={form.employee}
                  onChange={(e) => setForm({ ...form, employee: e.target.value })}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Amount"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
              <Input
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={resetForm} disabled={isSubmitting} className="w-full">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Allowance' : 'Save Allowance'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};
